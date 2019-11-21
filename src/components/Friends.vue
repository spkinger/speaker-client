<template>
    <div style="width: 100%; height: 100%;">
        <HeadBar title="好友列表"></HeadBar>
        <div style="width: 100%; height: 90px;"></div>
        <tab style="width: 100%; position: fixed; left: 0px; top: 46px; z-index: 100;">
            <tab-item
                v-bind:selected="showList === 'friends'"
                @click.native="changeShowList('friends')"
            >我的好友</tab-item>
            <tab-item
                :selected="showList === 'request' || showList === 'request_select'"
                @click.native="changeShowList('request')"
                badge-background="#38C972"
                badge-color="#fff"
                badge-label=""
            >好友申请</tab-item>
        </tab>

        <button-tab v-show="showList === 'request' || showList === 'request_got'" v-model="requestType" style="margin: 10px 35px 10px;">
            <button-tab-item @on-item-click="changeShowList('request')">我发出的申请</button-tab-item>
            <button-tab-item @on-item-click="changeShowList('request_got')">我收到的申请</button-tab-item>
        </button-tab>

        <!--我的好友-->
        <div id="friend_list" v-show="showList === 'friends'">
            <mescroll-vue ref="mescroll" :down="mescrollDown" :up="mescrollUp" @init="mescrollInit">
                <cell
                    v-for="friend in friendList"
                    :title="friend.nick_name"
                    :key="friend.id"
                    @click.native="showFA(friend.id)"
                    is-link
                    arrow-direction="down"
                >
                    <img slot="icon"
                         :src="nameAvatar(friend.nick_name, 15, '')"
                         alt=""
                         style="display: block;margin-right:10px;border-radius: 50%;"/>
                </cell>
            </mescroll-vue>
        </div>

        <!--我发出的申请-->
        <div id="request_list" v-show="showList === 'request'">
            <mescroll-vue ref="mescrollRequestSend" :down="mescrollDownRequestSend" :up="mescrollUpRequestSend" @init="mescrollInitRequestSend">
                <cell
                    v-for="user in requestSendList"
                    :title="'昵称：'+user.nick_name"
                    :key="user.id"
                    :value="'['+sendRequestStatus(user.status)+']'"
                    >
                    <img slot="icon"
                         v-bind:src="nameAvatar(user.nick_name, 15, '')"
                         alt=""
                         style="display: block;margin-right:10px;border-radius: 50%;"/>
                </cell>
            </mescroll-vue>
        </div>
        <!--我收到的申请-->
        <div id="got_list" v-show="showList === 'request_got'">
            <mescroll-vue ref="mescrollRequestGot" :down="mescrollDownRequestGot" :up="mescrollUpRequestGot" @init="mescrollInitRequestGot">
                <cell
                    v-for="user in requestGotList"
                    @click.native="ctlRequestSelect(user)"
                    :is-link="user.status === 0"
                    :title="'昵称：'+user.nick_name"
                    :key="user.id"
                    :value="'（'+gotRequestStatus(user.status)+'）'"
                >
                    <img slot="icon"
                         v-bind:src="nameAvatar(user.nick_name, 15, '')"
                         alt=""
                         style="display: block;margin-right:10px;border-radius: 50%;"/>
                </cell>
            </mescroll-vue>
        </div>

        <div v-if="showList === 'request_select'">
            <group label-width="5em" title="申请者">
                <cell primary="content" :title="requestUser.nick_name" :value="'('+requestUser.name+')'" :value-align="'left'"></cell>
            </group>
            <checklist
                :title="'同意/拒绝'"
                :options="requestSelect"
                :max="1"
                v-model="requestSelectValue"
                required></checklist>
            <div style="padding:25px;">
                <x-button
                    @click.native="submitRequestSelect"
                    type="primary">
                    确认
                </x-button>
                <x-button
                    @click.native="ctlRequestSelect(0)"
                >取消</x-button>
            </div>
        </div>

        <div v-transfer-dom>
            <actionsheet v-model="showFriendAction" :menus="friendAction" show-cancel @on-click-menu="friendActionSelect"></actionsheet>
        </div>

        <BottomBar select="friends"></BottomBar>
    </div>
</template>

<script>
    import { Tab, TabItem, ButtonTab, ButtonTabItem, Group, Cell, Actionsheet, TransferDom, Checklist, XButton } from 'vux'
    import HeadBar from './frame/HeadBar'
    import BottomBar from './frame/BottomBar'
    import Common from './Common'
    import MescrollVue from 'mescroll.js/mescroll.vue'

    export default {
        name: "Friends",
        directives: {
            TransferDom
        },
        components: {
            HeadBar,
            BottomBar,
            Tab,
            TabItem,
            ButtonTab,
            ButtonTabItem,
            Group,
            Cell,
            Actionsheet,
            Checklist,
            XButton,
            MescrollVue
        },
        data() {
            return {
                showList: 'friends',
                targetFriendId: 0,
                requestType: 0,
                requestUser: {},
                friendList: [],
                requestSendList: [],
                requestGotList: [],
                requestSelect: [{
                    key: '1',
                    value: '同意申请'
                }, {
                    key: '0',
                    value: '拒绝申请'
                }],
                requestSelectValue: ['1'],
                showFriendAction: false,
                friendAction: [{
                    label: '发起视频通话',
                    value: 'start_call'
                },
                //     {
                //     label: '发消息',
                //     value: 'send_msg'
                // }
                ],

                // 好友列表上滑加载
                mescroll: null,
                mescrollDown: {},
                mescrollUp: {
                    callback: this.loadFriends,
                    page: {
                        num: 0,
                        size: 10
                    },
                    htmlNodata: '<p class="upwarp-nodata">-- END --</p>',
                    noMoreSize: 5, // 如果列表已无数据,可设置列表的总数量要大于5才显示无更多数据;
                    toTop: {
                        // 回到顶部按钮
                        src: "../assets/icon/up_to_top.png",
                        offset: 1000 // 列表滚动1000px才显示回到顶部按钮
                    },
                    empty: {
                        // 列表第一页无任何数据时,显示的空提示布局; 需配置warpId才显示
                        warpId: "friend_list", //父布局的id
                        tip: "还没有好友，快去添加吧~"
                    }
                },

                // 我发出申请列表
                mescrollRequestSend: null,
                mescrollDownRequestSend: {},
                mescrollUpRequestSend: {
                    callback: this.loadRequestSend,
                    page: {
                        num: 0,
                        size: 10
                    },
                    htmlNodata: '<p class="upwarp-nodata">-- END --</p>',
                    noMoreSize: 5,
                    toTop: {
                        // 回到顶部按钮
                        src: "../assets/icon/up_to_top.png",
                        offset: 1000
                    },
                    empty: {
                        warpId: "request_list",
                        tip: "暂无申请~"
                    }
                },

                // 我收到申请列表
                mescrollRequestGot: null,
                mescrollDownRequestGot: {},
                mescrollUpRequestGot: {
                    callback: this.loadRequestGot,
                    page: {
                        num: 0,
                        size: 10
                    },
                    htmlNodata: '<p class="upwarp-nodata">-- END --</p>',
                    noMoreSize: 5,
                    toTop: {
                        // 回到顶部按钮
                        src: "../assets/icon/up_to_top.png",
                        offset: 1000
                    },
                    empty: {
                        warpId: "got_list",
                        tip: "暂无申请~"
                    }
                }
            };
        },
        created: function() {
            // 根据url参数判断显示的页面
            if (this.$route.params.type === 'friends') {
                this.changeShowList('friends');
            } else {
                this.changeShowList('request');
            }
        },
        methods: {
            nameAvatar: function(name, size, color) {
                return Common.methods.nameAvatar(name, size, color)
            },
            // 对好友的操作-选择
            friendActionSelect : function (key) {
                console.log(key);
                switch(key) {
                    case 'start_call':
                        this.$router.push({'path':'/speaker/sender/'+this.targetFriendId});
                        break;
                    default:
                        break;
                }
            },
            // 显示对好友的操作
            showFA: function(friendId) {
                this.targetFriendId = friendId;
                this.showFriendAction = true;
            },
            // 切换显示好友列表、申请列表
            changeShowList: function(select) {
                this.showList = select;
                this.tabSelect();
            },
            // 好友申请处理页面显示与关闭
            ctlRequestSelect: function(user) {
                if (user) {
                    // 仅处理新申请状态的申请记录
                    if (user.status !== 0) {
                        return;
                    }

                    this.requestUser = user;
                    this.changeShowList('request_select');
                } else {
                    this.requestUser = {};
                    this.changeShowList('request_got');
                }
            },
            // 好友申请中tab的显示
            tabSelect: function() {
                if (this.showList === 'request') {
                    this.requestType = 0;
                } else if (this.showList === 'request_got') {
                    this.requestType = 1;
                }
            },
            // 获取申请状态文字
            sendRequestStatus: function(status) {
                let statusStr = '';
                switch (status) {
                    case 0:
                        statusStr = '已申请';
                        break;
                    case 1:
                        statusStr = '已通过';
                        break;
                    case 2:
                        statusStr = '已拒绝';
                        break;
                }
                return statusStr;
            },
            gotRequestStatus: function(status) {
                let statusStr = '';
                switch (status) {
                    case 0:
                        statusStr = '新';
                        break;
                    case 1:
                        statusStr = '已通过';
                        break;
                    case 2:
                        statusStr = '已拒绝';
                        break;
                }
                return statusStr;
            },
            // 好友列表
            loadFriends: function(page, mescroll) {
                if (page.num === 1) {
                    this.friendList = [];
                }

                let vx = this;
                Common.methods.apiGet(
                    '/friend/my',
                    {
                        page: page.num,
                        page_size: page.size
                    },
                    function (res) {
                        if (res.data) {
                            vx.friendList = vx.friendList.concat(res.data);
                            mescroll.endSuccess(res.data.length)
                        }
                    },
                    function (res) {
                        mescroll.endErr()
                    },
                    function (error) {
                        mescroll.endErr()
                    }
                );
            },
            mescrollInit: function(mescroll) {
                // mescroll组件初始化的回调,可获取到mescroll对象
                this.mescroll = mescroll
            },
            // 发出的好友申请列表
            loadRequestSend: function(page, mescroll) {
                if (page.num === 1) {
                    this.requestSendList = [];
                }

                let vx = this;
                Common.methods.apiGet(
                    '/friend/request/my/send',
                    {
                        page: page.num,
                        page_size: page.size
                    },
                    function (res) {
                        if (res.data) {
                            vx.requestSendList = vx.requestSendList.concat(res.data);
                            mescroll.endSuccess(res.data.length)
                        }
                    },
                    function (res) {
                        mescroll.endErr()
                    },
                    function (error) {
                        mescroll.endErr()
                    }
                );
            },
            mescrollInitRequestSend: function (mescroll) {
                this.mescrollRequestSend = mescroll
            },
            // 收到的好友申请列表
            loadRequestGot: function(page, mescroll) {
                if (page.num === 1) {
                    this.requestGotList = [];
                }

                let vx = this;
                Common.methods.apiGet(
                    '/friend/request/my/got',
                    {
                        page: page.num,
                        page_size: page.size
                    },
                    function (res) {
                        if (res.data) {
                            vx.requestGotList = vx.requestGotList.concat(res.data);
                            mescroll.endSuccess(res.data.length)
                        }
                    },
                    function (res) {
                        mescroll.endErr()
                    },
                    function (error) {
                        mescroll.endErr()
                    }
                );
            },
            mescrollInitRequestGot: function (mescroll) {
                this.mescrollRequestSend = mescroll
            },
            // 提交好友申请处理选择
            submitRequestSelect: function() {
                // 提交
                let vx = this;
                Common.methods.apiPost(
                    '/friend/request/update',
                    {target_id: vx.requestUser.id, type: vx.requestSelectValue[0]},
                    function (res) {
                        if (res.data) {
                            // 请求成功
                            Common.methods.succMsg(res.msg);
                            vx.changeShowList('friends');
                            vx.mescroll.triggerDownScroll();
                        } else {
                            Common.methods.errMsg('请求失败');
                        }
                    }
                );
            },
        }
    }
</script>
<style scoped>
    #friend_list {
        height: 100%;
        height: -webkit-calc(100% - 143px);
        height: -moz-calc(100% - 143px);
        height: calc(100% - 143px);
    }
    #request_list {
        height: 100%;
        height: -webkit-calc(100% - 193px);
        height: -moz-calc(100% - 193px);
        height: calc(100% - 193px);
    }
    #got_list {
        height: 100%;
        height: -webkit-calc(100% - 193px);
        height: -moz-calc(100% - 193px);
        height: calc(100% - 193px);
    }
</style>
