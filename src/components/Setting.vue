<template>
    <div>
        <HeadBar title="设置"></HeadBar>

        <x-button
            @click.native="loginOut"
            type="primary"
            style="width: 90%; margin-top: 40%;">
            登出
        </x-button>
        <div v-transfer-dom>
            <confirm v-model="showLoginOut"
                     title="即将登出"
                     @on-cancel="showHideLogout"
                     @on-confirm="confirmLogout">
                <p style="text-align:center;">确定登出吗？</p>
            </confirm>
        </div>

        <BottomBar select="setting"></BottomBar>
    </div>
</template>

<script>
    import HeadBar from './frame/HeadBar'
    import BottomBar from './frame/BottomBar'
    import { Group, XButton, Confirm, TransferDomDirective as TransferDom } from 'vux'
    import Common from "./Common";

    export default {
        name: "Setting",
        components: {
            HeadBar,
            BottomBar,
            Group,
            XButton,
            Confirm
        },
        directives: {
            TransferDom
        },
        data: function() {
            return {
                showLoginOut: false
            };
        },
        methods: {
            loginOut: function () {
                this.showHideLogout();
            },
            showHideLogout: function () {
                this.showLoginOut = !this.showLoginOut;
            },
            confirmLogout: function () {
                Common.methods.userAuthDel();
                this.SpeakerWs.wsClose();
                this.$router.push({'path':'/login'});
            }
        }
    }
</script>

<style scoped>

</style>
