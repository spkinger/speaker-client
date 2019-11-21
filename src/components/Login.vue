<template>
    <div>
        <group style="padding-top: 40%;">
            <x-input title="账号" v-model="user_name" :max="50" type="text" novalidate :icon-type="nameIconType"
                     @on-blur="checkUserName"
                     @on-enter="login"></x-input>
            <x-input title="密码" v-model="passwd" :max="50" type="password" novalidate :icon-type="passwdIconType"
                     @on-blur="checkPasswd"
                     @on-enter="login"></x-input>
        </group>
        <x-button
            @click.native="login"
            type="primary"
            style="width: 90%; margin-top: 30px;">
            登录
        </x-button>
        <router-link to="/register" style="display: block;margin-top: 20px;width: 100%; text-align: center;">没有账号？注册</router-link>
    </div>
</template>

<script>
    import { XInput, Group, XButton, trim } from 'vux'
    import Common from "./Common";

    export default {
        name: "Login",
        components: {
            XInput,
            Group,
            XButton
        },
        data: function () {
            return {
                user_name: '',
                passwd: '',
                nameIconType: '',
                passwdIconType: ''
            };
        },
        methods: {
            checkUserName: function() {
                this.user_name = trim(this.user_name);
                if (this.user_name === '') {
                    this.nameIconType = 'error';
                } else {
                    this.nameIconType = 'success';
                }
            },
            checkPasswd: function() {
                this.passwd = trim(this.passwd);
                if (this.passwd === '') {
                    this.passwdIconType = 'error';
                } else {
                    this.passwdIconType = 'success';
                }
            },
            login: function () {
                this.checkUserName();
                this.checkPasswd();
                if (this.user_name === '') {
                    return;
                }
                if (this.passwd === '') {
                    return;
                }

                let vx = this;
                Common.methods.apiPost(
                    '/login',
                    {user_name: vx.user_name, passwd: vx.passwd},
                    function (res) {
                        if (res.data) {
                            // 登录成功
                            Common.methods.succMsg(res.msg);
                            Common.methods.userAuthSet(res.data);
                            vx.SpeakerWs.initWs(); // 有登录态后开启websocket连接
                            vx.$router.push({'path':'/friends/friends'});
                        } else {
                            Common.methods.errMsg('登录失败');
                        }
                    }
                );
            }
        }
    }
</script>

<style scoped>

</style>
