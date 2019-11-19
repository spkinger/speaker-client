<script>
    import Vue from 'vue'
    import router from '../router'
    import  { Alert, AlertModule, querystring, ToastPlugin } from 'vux'

    Vue.use(ToastPlugin, {position: 'middle', width: 'auto'});

    export default {
        name: "Common",
        components: {
            Alert,
            AlertModule,
            router
        },
        data: function() {
            return {
                commonToast: false,
                commonToastMsg: '',
                showCommonConfirm: false,
            };
        },
        methods: {
            succMsg: function(msg) {
                Vue.$vux.toast.text(msg);
            },
            errMsg: function(msg) {
                AlertModule.show({
                    title: '提示',
                    content: msg
                });
            },
            // 存储用户登录状态
            userAuthSet: function(data) {
                localStorage.setItem('speaker_user_auth', JSON.stringify(data))
            },
            // 返回用户登录状态
            userAuthGet: function() {
                let userAuth = localStorage.getItem('speaker_user_auth');
                if (userAuth) {
                    return JSON.parse(userAuth);
                } else {
                    this.goToLogin();
                    return {};
                }
            },
            // 删除用户登录状态
            userAuthDel: function() {
                localStorage.removeItem('speaker_user_auth');
            },
            goToLogin: function() {
                if (router.app.$route.path !== '/login') {
                    router.push({'path':'/login'});
                }
            },
            apiGet: function(path, data, succFunc = '', errFunc = '', exceptFunc = '') {
                let query = querystring.stringify(data);
                query = query === '' ? '' : '?'+query;
                let vx = this;
                let req = new Request(conf.serverUrl+path+query, {
                    method: "GET",
                    headers: new Headers({
                        'Authorization': encodeURIComponent(JSON.stringify(vx.userAuthGet()))
                    })
                });
                fetch(req)
                .then(function (response) {
                    // 根据响应更新的token
                    vx.updateLocalAuth(response);

                    return response.json()
                })
                .then(function (res) {
                    if (res && res.code === 0) {
                        if (typeof succFunc === 'function') {
                            succFunc(res);
                        }
                    } else {
                        // 未登录响应处理
                        if (res && res.code === 4000) {
                            vx.goToLogin();
                        }

                        if (typeof errFunc === 'function') {
                            errFunc(res);
                        }
                        vx.errMsg(res.msg);
                    }
                })
                .catch( function(error) {
                    console.log(error);
                    if (typeof errFunc === 'function') {
                        exceptFunc(error);
                    }
                })
            },
            apiPost: function (path, data, succFunc = '', errFunc = '', exceptFunc = '') {
                let formData = new FormData();
                for (let key in data) {
                    formData.append(key, data[key]);
                }

                let vx = this;
                fetch(conf.serverUrl+path,{
                    body: formData,
                    method: 'POST',
                    headers: new Headers({
                        'Authorization': encodeURIComponent(JSON.stringify(vx.userAuthGet()))
                    })
                })
                .then(function (response) {
                    // 根据响应更新的token
                    vx.updateLocalAuth(response);

                    return response.json()
                })
                .then(function (res) {
                    if (res && res.code === 0) {
                        if (typeof succFunc === 'function') {
                            succFunc(res);
                        }
                        vx.succMsg(res.msg);
                    } else {
                        // 未登录响应处理
                        if (res && res.code === 4000) {
                            this.goToLogin();
                        }

                        if (typeof errFunc === 'function') {
                            errFunc(res);
                        }
                        vx.errMsg(res.msg);
                    }
                })
                .catch( function(error) {
                    console.log(error);
                    if (typeof errFunc === 'function') {
                        exceptFunc(error);
                    }
                })
            },
            /**
             * 字符头像
             * @return {string}
             */
            nameAvatar: function (name, size, color) {
                name  = name || '';
                size  = size || 60;
                let colours = [
                        "#c1e4e9", "#a2d7dd", "#a0d8ef", "#89c3eb", "#84a2d4", "#83ccd2", "#84b9cb", "#00a3af", "#59b9c6", "#2792c3",
                        "#4c6cb3", "#507ea4", "#165e83", "#bbc8e6", "#bbbcde", "#8491c3", "#8491c3", "#eae5e3", "#f3f3f2", "#e5e4e6"
                    ],
                    nameSplit = String(name).split(' '),
                    initials, charIndex, colourIndex, canvas, context, dataURI;
                if (nameSplit.length === 1) {
                    initials = nameSplit[0] ? nameSplit[0].charAt(0):'?';
                } else {
                    initials = nameSplit[0].charAt(0) + nameSplit[1].charAt(0);
                }
                if (window.devicePixelRatio) {
                    size = (size * window.devicePixelRatio);
                }

                charIndex     = (initials === '?' ? 72 : initials.charCodeAt(0)) - 64;
                colourIndex   = charIndex % 20;
                canvas        = document.createElement('canvas');
                canvas.width  = size;
                canvas.height = size;
                context       = canvas.getContext("2d");

                context.fillStyle = color ? color : colours[colourIndex - 1];
                context.fillRect (0, 0, canvas.width, canvas.height);
                context.font = Math.round(canvas.width/2)+"px 'Microsoft Yahei'";
                context.textAlign = "center";
                context.fillStyle = "#FFF";
                context.fillText(initials, size / 2, size / 1.5);
                dataURI = canvas.toDataURL();
                canvas  = null;
                return dataURI;
            },
            // 获取到更新的token，进行更新（目前移动端目前不支持）
            updateLocalAuth: function (response) {
                // 响应头中有才进行处理
                let headerAuth = response.headers.get('Authorization');
                if (headerAuth) {
                    headerAuth = decodeURIComponent(headerAuth);
                    let auth = JSON.parse(headerAuth);
                    this.userAuthSet(auth);
                }
            }
        }
    }
</script>

<style scoped>

</style>
