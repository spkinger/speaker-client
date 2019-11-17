<template>
    <div style="width: 100%;">
        <HeadBar title="我的二维码"></HeadBar>

        <div style="width: 100%; margin-top: 30%;">
            <qrcode style="margin: 0 auto; text-align: center;" v-if="myLink !== ''" :value="myLink" type="img"></qrcode>
            <div style="margin: 0 auto; text-align: center;" v-if="myLink === ''">用户未登录</div>
            <div style="margin: 10px auto; text-align: center;">{{ myQrLabel }}</div>
        </div>

        <BottomBar select="my_qrcode"></BottomBar>
    </div>
</template>

<script>
    import { Qrcode, Flexbox, FlexboxItem } from 'vux'
    import HeadBar from './frame/HeadBar'
    import BottomBar from './frame/BottomBar'
    import Common from "./Common";

    export default {
        name: "MyQrcode",
        components: {
            HeadBar,
            BottomBar,
            Qrcode,
            Flexbox,
            FlexboxItem
        },
        data: function () {
            return {
                myLink: '',
                myQrLabel: ''
            };
        },
        created() {
            let user = Common.methods.userAuthGet();
            if (user.id) {
                this.myQrLabel = user.nick_name+"的二维码";
                this.myLink = '/user/search/add_request/'+user.id;
            }
        }
    }
</script>

<style scoped>

</style>
