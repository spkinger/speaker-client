<template>
    <div>
        <tabbar style="width: 100%; position: fixed; left: 0; bottom: 0; z-index: 100;">
            <tabbar-item v-bind:selected="select === 'friends'" link="/friends/friends">
                <img v-if="select !== 'friends'" slot="icon" src="../../assets/icon/email.png">
                <img v-if="select === 'friends'" slot="icon" src="../../assets/icon/email-active.png">
                <span slot="label">好友</span>
            </tabbar-item>
            <tabbar-item v-bind:selected="select === 'setting'" link="/setting">
                <img v-if="select !== 'setting'" slot="icon" src="../../assets/icon/setting.png">
                <img v-if="select === 'setting'" slot="icon" src="../../assets/icon/setting-active.png">
                <span slot="label">设置</span>
            </tabbar-item>
        </tabbar>
    </div>
</template>

<script>
    import { Tabbar, TabbarItem } from 'vux'
    export default {
        components: {
            Tabbar,
            TabbarItem
        },
        props: ['select']
    }
</script>
