<template>
    <div>
        <HeadBar :title="title"></HeadBar>
        <div style="width: 100%; height: 46px;"></div>
        <!--查找用户-->
        <div id="search_user_list" v-show="pageSelect === 'user_search'">
            <search
                v-model="searchVal"
                position="absolute"
                auto-scroll-to-top
                top="0"
                placeholder="搜索用户昵称"
                style="z-index:101"
                @on-submit="searchUsers"
                ref="search"></search>
            <mescroll-vue ref="mescroll" :down="mescrollDown" :up="mescrollUp" @init="mescrollInit">
                <cell
                    v-for="user in userList"
                    :title="user.nick_name"
                    :key="user.id"
                    is-link
                    @click.native="showAddRequest(user.id)"
                >
                    <img slot="icon"
                         :src="nameAvatar(user.nick_name, 15, '')"
                         alt=""
                         style="display: block;margin-right:10px;border-radius: 50%;"/>
                </cell>
            </mescroll-vue>
        </div>
        <!--用户信息-->
        <div v-if="pageSelect === 'add_request'">
            <group label-width="5em" title="用户信息">
                <cell primary="content" :title="requestUser.nick_name" :value="'('+requestUser.name+')'" :value-align="'left'"></cell>
            </group>
            <div style="padding:25px;">
                <x-button
                    @click.native="submitAddRequest"
                    type="primary">
                    申请好友
                </x-button>
                <x-button
                    @click.native="goback()"
                >取消</x-button>
            </div>
        </div>

        <BottomBar :select="pageSelect"></BottomBar>
    </div>
</template>

<script>
    import { Search, Group, Cell, XButton } from 'vux'
    import HeadBar from './frame/HeadBar'
    import BottomBar from './frame/BottomBar'
    import Common from "./Common";
    import MescrollVue from 'mescroll.js/mescroll.vue'

    export default {
        name: "SearchUser",
        components: {
            HeadBar,
            BottomBar,
            Search,
            Group,
            Cell,
            XButton,
            MescrollVue,
            Common
        },
        data: function () {
            return {
                title: '用户搜索',
                pageSelect: 'user_search',
                requestUser: {},
                searchVal: '',
                userList: [],
                // 上滑刷新
                mescroll: null,
                mescrollDown: {},
                mescrollUp: {
                    callback: this.loadUsers,
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
                        warpId: "search_user_list", //父布局的id
                        tip: "尚未搜索~"
                    }
                }
            };
        },
        created: function() {
            // 根据url参数判断显示的页面
            if (this.$route.params.type === 'add_request' && this.$route.params.user_id) {
                this.showAddRequest(this.$route.params.user_id);
            } else {
                this.showSearchUser();
            }
        },
        watch: {
            $route(to, from) {
                let path = to.path;
                if (path.substr(0, 13) === '/user/search/' && path.length > 25) {
                    let type = path.substr(13, 11);
                    let id = path.substr(25, path.length);

                    if (type === 'add_request' && id) {
                        this.showAddRequest(id);
                    } else {
                        this.showSearchUser();
                    }
                }
            }
        },
        methods: {
            nameAvatar: function(name, size, color) {
                return Common.methods.nameAvatar(name, size, color)
            },
            searchUsers: function() {
                // 重置搜索列表
                this.mescroll.resetUpScroll(true);
            },
            loadUsers: function(page, mescroll) {
                // 无搜索内容时不显示结果
                if (this.searchVal.length === 0) {
                    this.userList = [];
                    mescroll.endSuccess(0);
                    return;
                }

                if (page.num == 1) {
                    this.userList = [];
                }

                let vx = this;
                Common.methods.apiGet(
                    '/user/search',
                    {
                        page: page.num,
                        page_size: page.size,
                        nick_name: vx.searchVal
                    },
                    function (res) {
                        if (res.data) {
                            vx.userList = vx.userList.concat(res.data);
                            mescroll.endSuccess(res.data.length);
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
            // mescroll组件初始化的回调,可获取到mescroll对象
            mescrollInit: function(msc) {
                this.mescroll = msc
            },
            showAddRequest: function (userID) {
                this.userDetail(userID);
                this.title = '申请好友';
                this.pageSelect = 'add_request';
            },
            showSearchUser: function () {
                this.requestUser = {};
                this.title = '用户搜索';
                this.pageSelect = 'user_search';
            },
            userDetail: function (userID) {
                if (!userID) {
                    return;
                }

                let vx = this;
                Common.methods.apiGet(
                    '/user/detail',
                    {
                        user_id: userID
                    },
                    function (res) {
                        if (res.data) {
                            vx.requestUser = res.data;
                        } else {
                            let msg = res.msg ? res.msg : '用户不存在';
                            Common.methods.errMsg(msg);
                        }
                    },
                );
            },
            // 取消按钮
            goback: function () {
                if (this.userList.length > 0) {
                    this.showSearchUser();
                } else {
                    this.$router.go(-1);
                }
            },
            // 提交好友申请
            submitAddRequest: function () {
                if (!this.requestUser) {
                    Common.methods.errMsg('未选择用户');
                    return;
                }

                let vx = this;
                Common.methods.apiPost(
                    '/friend/request/add',
                    {target_id: vx.requestUser.id},
                    function (res) {
                        if (res.data) {
                            // 申请成功
                            Common.methods.succMsg(res.msg);
                            vx.$router.push({'path':'/friends/request'});
                        } else {
                            let msg = res.msg ? res.msg : '申请失败';
                            Common.methods.errMsg(msg);
                        }
                    }
                );
            }
        }
    }
</script>
