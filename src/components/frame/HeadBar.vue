<template>
    <div>
        <x-header
            :left-options="{showBack: false}"
            @on-click-more="showMenus = true"
            style="width: 100%; position: fixed; left: 0; top: 0; z-index: 100;">
            {{ title }}<cell slot="right"
                             :title="'+'"
                          @click.native="showAddMenu"
                          style="font-size:35px;margin-top:-14px;"></cell>
        </x-header>
        <div v-transfer-dom>
            <actionsheet
                :menus="addMenuAction"
                v-model="addMenuStatus"
                @on-click-menu="addMenuSelect"
                show-cancel></actionsheet>
        </div>
    </div>
</template>

<script>
    import { XHeader, Popover, Actionsheet, TransferDom, Cell } from 'vux'

    export default {
        name: "HeadBar",
        directives: {
            TransferDom
        },
        components: {
            XHeader,
            Popover,
            Actionsheet,
            Cell
        },
        props: ['title'],
        data: function() {
            return {
                addMenuStatus: false,
                addMenuAction: [{
                    label: '查找用户',
                    value: 'search_user'
                }, {
                    label: '扫码',
                    value: 'scan_qrcode'
                }, {
                    label: '我的二维码',
                    value: 'my_qrcode'
                }]
            };
        },
        methods: {
            showAddMenu: function () {
                this.addMenuStatus = !this.addMenuStatus;
            },
            addMenuSelect: function (key) {
                let vx = this;
                switch (key) {
                    case 'search_user':
                        if (vx.$route.path !== '/user/search') {
                            vx.$router.push({'path':'/user/search/user_search/0'});
                        }
                        break;
                    case 'scan_qrcode':
                        if (vx.$route.path !== '/qrcode/scan') {
                            vx.$router.push({'path':'/qrcode/scan'});
                        }
                        break;
                    case 'my_qrcode':
                        if (vx.$route.path !== '/qrcode/my') {
                            vx.$router.push({'path':'/qrcode/my'});
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
</script>

<style scoped>

</style>
