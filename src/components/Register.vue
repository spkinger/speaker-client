<template>
    <div class="spk_register">
        <group>
            <x-input title="账号" v-model="user_name" type="text" placeholder="仅允许数字、字母、下划线"
                     @on-change="checkUserName" :debounce="100"
                     @on-enter="reg"
                     novalidate :icon-type="nameIconType"></x-input>
            <x-input title="昵称" v-model="nick_name" type="text" placeholder="请填写昵称"
                     @on-change="checkNickName" :debounce="100"
                     @on-enter="reg"
                     novalidate :icon-type="nickNameIconType"></x-input>
            <x-input title="密码" v-model="passwd" type="password" placeholder="密码不能小于8位"
                     novalidate :icon-type="passwdIconType"
                     @on-change="checkPasswd" :debounce="100"
                     @on-enter="reg"></x-input>
            <x-input title="重复密码" v-model="passwd_repeat" type="password" placeholder="密码不能小于8位"
                     novalidate :icon-type="rpPasswdIconType"
                     @on-change="checkPasswdRepeat" :debounce="100"
                     @on-enter="reg"></x-input>
        </group>
        <x-button
            @click.native="reg"
            type="primary"
            style="width: 90%; margin-top: 30px;">
            注册
        </x-button>
        <router-link to="/login" style="display: block;margin-top: 20px;width: 100%; text-align: center;">登录</router-link>
        <toast v-model="showAlter" type="text" :time="800" position="middle" width="200">{{ alertMsg }}</toast>
    </div>
</template>

<script>
    import { XInput, Group, XButton, Toast, trim } from 'vux'
    import Router from 'vue-router'
    import Common from "./Common";

    export default {
        name: "Register",
        components: {
            XInput,
            Group,
            XButton,
            Router,
            Toast
        },
        data: function () {
            return {
                user_name: '',
                nick_name: '',
                passwd: '',
                passwd_repeat: '',
                showAlter: false,
                alertMsg: '',
                nameIconType: '',
                nickNameIconType: '',
                passwdIconType: '',
                rpPasswdIconType: ''
            };
        },
        methods: {
            userNameFilter: function() {
                this.user_name = this.user_name.replace(/[^A-Za-z0-9_]+/g, '');
            },
            checkUserName: function() {
                this.userNameFilter();
                if (trim(this.user_name) === '' || this.user_name.length > 50) {
                    this.nameIconType = 'error';
                } else {
                    this.nameIconType = 'success';
                }
            },
            checkNickName: function() {
                if (trim(this.nick_name) === '' || this.nick_name.length > 50) {
                    this.nickNameIconType = 'error';
                } else {
                    this.nickNameIconType = 'success';
                }
            },
            checkPasswd: function() {
                this.passwd = this.passwd.replace(/\W+/g, '');
                if (this.passwd === '' || this.passwd.length < 8 || this.passwd.length > 50) {
                    this.passwdIconType = 'error';
                } else {
                    this.passwdIconType = 'success';
                }
            },
            checkPasswdRepeat: function() {
                this.passwd_repeat = this.passwd_repeat.replace(/\W+/g, '');
                if (this.passwd_repeat === '' || this.passwd !== this.passwd_repeat) {
                    this.rpPasswdIconType = 'error';
                } else {
                    this.rpPasswdIconType = 'success';
                }
            },
            reg: function () {
                this.checkUserName();
                this.checkNickName();
                this.checkPasswd();
                this.checkPasswdRepeat();
                if (this.nameIconType === 'error') {
                    return;
                }
                if (this.nickNameIconType === 'error') {
                    return;
                }
                if (this.passwdIconType === 'error') {
                    return;
                }
                if (this.rpPasswdIconType === 'error') {
                    return;
                }

                let vx = this;
                Common.methods.apiPost(
                    '/register',
                    {user_name: vx.user_name, nick_name: vx.nick_name, passwd: vx.passwd},
                    function (res) {
                        if (res.data) {
                            // 注册成功
                            Common.methods.succMsg(res.msg);
                            Common.methods.userAuthSet(res.data);
                            vx.SpeakerWs.initWs(); // 注册成功时会有登录态，此时开启websocket连接
                            vx.$router.push({'path':'/friends/friends'});
                        } else {
                            Common.methods.errMsg('登录失败');
                        }
                    }
                );
            },
            alert: function (msg) {
                this.alertMsg = msg;
                this.showAlter = true;
            }
        }
    }
</script>

<style scoped>
.spk_register{
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    transform: translate(0, -50%);
}
</style>
