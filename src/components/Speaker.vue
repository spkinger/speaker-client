<template>
    <div style="width:100%;height:100%;">
        <div class="waiting_box">
            <div class="target_user">
                <img slot="icon"
                     :src="nameAvatar('spkinger', 46, '')"
                     alt=""
                     class="target_avatar"/>
                <div class="target_name">spkinger</div>
            </div>
            <video class="remote_video" :src-object.prop.camel="remoteStream" playsinline autoplay muted></video>
            <video class="local_video" :src-object.prop.camel="localStream" playsinline autoplay muted></video>
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
spe
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
                localStream: {},
                remoteStream: {},
                targetID: 0,
            };
        },
        created: async function() {
            if (!this.$route.params.user_id) {
                return;
            }
            this.targetID = parseInt(this.$route.params.user_id);

            // 根据url参数判断显示的页面
            if (this.$route.params.type === 'sender') {
                this.speakerCtlType = 'sender';
                this.speakerBtnStatus = 'canHangUp';
                await this.SpeakerWs.start(this.targetID);
            } else if(this.$route.params.type === 'receiver') {
                this.speakerCtlType = 'receiver';
                this.speakerBtnStatus = 'waitAnswer';
            }
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
                await this.SpeakerWs.callAccess(this.targetID);
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

    .remote_video {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
    .local_video {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 30%;
        height: 30%;
    }
</style>
