<template>
    <div style="width:100%;height:100%;">
        <qrcode-stream style="width: 100%; height: 100%;" @decode="onDecode"></qrcode-stream>
        <div class="qrbox"></div>
        <div class="qrbottom">
            <img class="qrlink" slot="icon"
                 src="../assets/icon/close_filled.png"
                 alt=""
                 @click="goback"
                 style="display: block;margin-right:10px;border-radius: 50%;"/>
        </div>
    </div>
</template>

<script>
    import { QrcodeStream } from 'vue-qrcode-reader'

    export default {
        name: "ScanQrcode",
        components: {
            QrcodeStream
        },
        methods: {
            onDecode (decodedString) {
                if (decodedString.substr(0, 25) === '/user/search/add_request/') {
                    this.$router.push({'path':decodedString});
                }
            },
            goback () {
                this.$router.go(-1)
            }
        }
    }
</script>

<style scoped>
    .qrbox {
        position:absolute;
        top:0;
        width:100%;
        height:0;
        padding-bottom: 100%;
        background:rgba(0,0,0,0.6);
        -webkit-clip-path: polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%);
        clip-path: polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%);
    }
    .qrbottom {
        position:absolute;
        top:0;
        width:100%;
        height:0;
        padding-bottom: 100%;
        margin-top: 99.9%;
        background:rgba(0,0,0,0.6);
    }
    .qrlink {
        position:absolute;
        top: 40%;
        left: 50%;
        margin-top:-32px;
        margin-left: -32px;
    }
</style>
