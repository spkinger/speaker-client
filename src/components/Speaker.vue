<template>
    <div style="width:100%;height:100%;">
        <div class="waiting_box">
            <div v-if="showTargetUser" class="target_user target_user_fadein">
                <img slot="icon"
                     :src="nameAvatar(targetUser.nick_name, 46, '')"
                     alt=""
                     class="target_avatar"/>
                <div class="target_name">{{ targetUser.nick_name }}</div>
            </div>
            <video v-bind:class="{min_video: remoteShowMin, full_screen_video: !remoteShowMin}"
                   :src-object.prop.camel="remoteStream" playsinline autoplay muted></video>
            <video v-bind:class="{min_video: localShowMin, full_screen_video: !localShowMin}"
                   @click="exchangeVideo" :src-object.prop.camel="localStream" playsinline autoplay muted></video>
            <audio class="remote_audio" :src-object.prop.camel="remoteStream" controls autoplay></audio>
            <div v-if="speakerBtnStatus === 'waitAnswer'" class="speaker_ctl">
                <img class="speaker_access_icon" @click="callAccess" slot="icon" src="../assets/icon/tel.png" alt="">
                <img class="speaker_refuse_icon" @click="callRefuse" slot="icon" src="../assets/icon/hang_up.png" alt="">
            </div>
            <div v-if="speakerBtnStatus === 'canHangUp'" class="speaker_ctl">
                <img class="speaker_hang_up_icon" @click="hangUp" slot="icon" src="../assets/icon/hang_up.png" alt="">
            </div>
        </div>
    </div>
</template>
<script>
    import Common from "./Common";

    export default {
        name: "Speaker",
        components: {
            Common
        },
        data: function() {
            return {
                speakerBtnStatus: 'canHangUp', // 等待接听：waitAnswer; 可挂机：canHangUp
                speakerCtlType: 'sender', // 发起方：sender；接收方：receiver
                localStream: null,
                remoteStream: null,
                targetID: 0,
                targetUser: null,
                showTargetUser: false,
                localShowMin: true,
                remoteShowMin: false
            };
        },
        created: async function() {
            let vx = this;
            if (!this.$route.params.user_id) {
                return;
            }
            this.targetID = parseInt(this.$route.params.user_id);
            this.SpeakerWs.setLocalVideoFunc(function (stream) {
                vx.localStream = stream;
            });
            this.SpeakerWs.setRemoteVideoFunc(function (stream) {
                vx.remoteStream = stream;
            });

            // 根据url参数判断显示的页面
            if (this.$route.params.type === 'sender') {
                this.speakerCtlType = 'sender';
                this.speakerBtnStatus = 'canHangUp';
                await this.SpeakerWs.start(this.targetID);
            } else if(this.$route.params.type === 'receiver') {
                this.speakerCtlType = 'receiver';
                this.speakerBtnStatus = 'waitAnswer';
            }

            // 显示对方头像
            this.getUserInfo(this.targetID);
        },
        methods: {
            nameAvatar: function(name, size, color) {
                return Common.methods.nameAvatar(name, size, color)
            },
            // 挂机
            hangUp: function () {
                this.SpeakerWs.hangUp(this.targetID);
            },
            // 拒绝对方
            callRefuse: function () {
                this.SpeakerWs.callRefuse(this.targetID);
            },
            // 接听视频通话
            callAccess: async function () {
                this.speakerBtnStatus = 'canHangUp';
                await this.SpeakerWs.callAccess(this.targetID);
            },
            getUserInfo: function (userId) {
                let vx = this;
                Common.methods.apiGet(
                    '/user/detail',
                    {
                        user_id: userId
                    },
                    function (res) {
                        if (res.data) {
                            vx.targetUser = res.data;
                            vx.showTargetUser = true;
                        }
                    }
                );
            },
            // 切换远程和本地视频窗口
            exchangeVideo: function () {
                this.localShowMin = !this.localShowMin;
                this.remoteShowMin = !this.remoteShowMin;
            }
        }
    }
</script>

<style scoped>
    .waiting_box {
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background-image:linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('../assets/bg/raining.jpg');
        background-repeat: no-repeat;
        background-size: auto 100%;
        background-position: center top;
        background-attachment: fixed;
    }
    .target_user {
        position: absolute;
        top: 30%;
        left: 50%;
        margin-top: -69px;
        margin-left: -69px;
    }
    .target_user_fadein {
        opacity: 0;
        -webkit-animation: user_fadein 2s linear forwards;
        animation: user_fadein 2s linear forwards;
    }
    @-webkit-keyframes user_fadein {
        100% { opacity: 1; }
    }
    @keyframes user_fadein {
        100% { opacity: 1; }
    }
    .target_avatar {
        border-radius: 50%;
    }
    .target_name {
        color: #ffffff;
        font-size: 22px;
        width: 100%;
        text-align: center;
    }
    .speaker_ctl {
        position: absolute;
        bottom: 15%;
        left: 17.5%;
        width: 65%;
        text-align: center;
    }
    .speaker_access_icon {
        float: left;
        animation: heart 0.7s ease-in-out 0.1s infinite alternate;
    }
    .speaker_refuse_icon {
        float: right;
        animation: heart 0.7s ease-in-out 0.8s infinite alternate;
    }
    .speaker_hang_up_icon {
        /*animation: heart 0.6s ease-in 0.1s infinite alternate;*/
    }
    @keyframes heart{
        from{transform:translate(0,0)}
        to{transform:translate(0,10px)}
    }
    .full_screen_video {
        position: absolute;
        top: 0;
        left: 50%;
        height: 100%;
        transform: translate(-50%, 0);
    }
    .min_video {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 20%;
    }
    .remote_audio {
        display: none;
    }
</style>
