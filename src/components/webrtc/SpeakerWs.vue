<script>
    import router from "../../router"
    import Common from "../Common";

    const MsgTypeSys = 1; // 客户端与服务端通信
    const MsgTypeUser = 2; // 客户端与客户端的通信
    const ChildTypeSysInit = 1; // 初始化用户管道
    const ChildTypeUserICE = 1; // ICE
    const ChildTypeUserOffer = 2; // offer
    const ChildTypeUserAnswer = 3; // answer
    const ChildTypeUserPing = 4; // ping通信对方是否在线
    const ChildTypeUserPong = 5; // 响应ping的一端
    const ChildTypeUserCall = 6; // 呼叫对方
    const ChildTypeUserCallAccess = 7; // 接受呼叫
    const ChildTypeUserCallRefuse = 8; // 拒绝呼叫
    const ChildTypeUserHangUp = 9; // 挂机

    export default {
        name: "SpeakerWs",
        components: {
            Common,
            router
        },
        ws: {},
        pc: {}, // WebRTC连接
        localStream: {}, // 本地视频流
        remoteStream: {}, // 远程视频流
        // setLocalVideo: function(stream) {},
        // setRemoteVideo: function(stream) {},
        localOutPut: {},
        remoteOutPut: {},
        connStatus: 0, // 0未连接，1连接中，2连接成功，-1不在线
        targetID: 0,
        offerOptions: {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        },

        // 初始化WebSocket
        initWs: function () {
            let vx = this;
            vx.ws = new WebSocket(conf.wssUrl);

            // WebSocket连上时的处理
            vx.ws.onopen = function(evt) {
                console.log("Connection open ...");
                // 每当websocket打开，初始化一个用户管道
                vx.wsSendData(MsgTypeSys, ChildTypeSysInit, 0, {});
            };

            // WebSocket收到消息时的处理
            vx.ws.onmessage = function(evt) {
                let wsData = JSON.parse(evt.data);
                console.log(wsData);
                vx.wsOnMsg(wsData.child_type, wsData.from, wsData.data);
            };

            // WebSocket关闭
            vx.ws.onclose = function(evt) {
                console.log("Connection closed!");
            };
        },

        /**
         * 接到消息的处理
         * @param childType int 消息子类型
         * @param target int 发消息方的id
         * @param data 消息数据
         * @returns {Promise<void>}
         * @constructor
         */
        wsOnMsg: async function(childType, target, data) {
            switch(childType) {
                case ChildTypeUserICE:
                    // 收到ice消息的处理
                    console.log('receive ice');
                    await this.onReceiveICE(target, data);
                    break;
                case ChildTypeUserOffer:
                    // 收到offer消息的处理
                    console.log('receive offer');
                    await this.onReceiveOffer(target, data);
                    break;
                case ChildTypeUserAnswer:
                    // 收到answer消息的处理
                    console.log('receive answer');
                    await this.onReceiveAnswer(data);
                    break;
                case ChildTypeUserPing:
                    // 收到ping消息的处理
                    this.pong(target);
                    break;
                case ChildTypeUserPong:
                    // 收到pong消息的处理
                    this.onPong(target);
                    break;
                case ChildTypeUserCall:
                    // 收到呼叫消息的处理
                    this.onReceiveCall(target);
                    break;
                case ChildTypeUserCallAccess:
                    // 收到允许呼叫消息的处理
                    await this.onReceiveCallAccess(target);
                    break;
                case ChildTypeUserCallRefuse:
                    // 收到拒绝呼叫消息的处理
                    this.onReceiveCallRefuse();
                    break;
                case ChildTypeUserHangUp:
                    // 收到挂机消息的处理
                    this.onHangUp();
                    break;
                default:
                    console.log('receive other');
                    break;
            }
        },

        // 通过websocket发送数据
        wsSendData: function(type, child_type, target, data) {
            let user = this.getSelf();
            let wsMsg = JSON.stringify(this.wsMsgGenerate(user, type, child_type, target, data));
            this.ws.send(wsMsg);
        },

        // 生成ws消息的数据结构
        wsMsgGenerate: function(user, type, child_type, target, data) {
            return {
                auth: user,
                type: type,
                child_type: child_type,
                target: target,
                data:data
            }
        },

        // 获取用户对象
        getSelf: function() {
            return Common.methods.userAuthGet();
        },

        // ping对等端是否在线，并通知对方初始化对等连接对象
        ping: function(targetID) {
            this.wsSendData(MsgTypeUser, ChildTypeUserPing, targetID, {});
        },

        // 响应ping方
        pong: function(target) {
            this.wsSendData(MsgTypeUser, ChildTypeUserPong, parseInt(target), {});
        },

        // 收到pong的处理
        onPong: function(targetID) {
            this.callStart(targetID); // 开始呼叫对方
        },

        // 呼叫对方
        callStart: function(targetID) {
            this.wsSendData(MsgTypeUser, ChildTypeUserCall, targetID, {});
        },

        // 返回
        speakerBack: function(msg = '') {
            if (msg) {
                Common.methods.errMsg(msg);
            }
            router.push({'path':'/friends/friends'});
        },

        // 初始化对等连接对象
        initRTC: function() {
            let vx = this;
            vx.pc = new RTCPeerConnection(conf.RTCConfig);
            vx.pc.addEventListener('icecandidate', e => vx.onIceCandidate(vx.pc, e));
            vx.pc.addEventListener('iceconnectionstatechange', e => vx.onIceStateChange(vx.pc, e));
            vx.pc.addEventListener('track', vx.gotRemoteStream);
            console.log('created RTC connection');
        },

        // 超多倒计时认为对方不在线
        waitSetOffline: function() {
            let vx = this;
            window.setTimeout(function () {
                // 10秒后还在连接中，认为对方不在线
                if (vx.connStatus === 1) {
                    vx.speakerBack('对方不在线');
                }
            }, 10000);
        },

        // 将本地媒体加载到RTC连接对象
        localAddMedia: async function() {
            // 获取媒体流
            let vx = this;
            try {
                this.localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
                // 将媒体流加载入对等连接对象
                this.localStream.getTracks().forEach(track => vx.pc.addTrack(track, vx.localStream));
            } catch (e) {
                console.log("get user media error", e);
                this.speakerBack('视频捕捉失败');
            }
        },

        // 接受呼叫
        callAccess: async function(targetID) {
            // 初始化对等连接对象
            this.initRTC();
            // 挂载本地媒体
            await this.localAddMedia();
            // 发送接受呼叫状态给对方
            this.wsSendData(MsgTypeUser, ChildTypeUserCallAccess, targetID, {});
        },

        // 拒绝呼叫
        callRefuse: function(targetID) {
            this.speakerBack();
            this.wsSendData(MsgTypeUser, ChildTypeUserCallRefuse, targetID, {});
        },

        // 收到呼叫
        onReceiveCall: function(targetID) {
            console.log("receive call");
            // 接收方跳转speaker页面(接收方)
            router.push({'path':'/speaker/receiver/'+targetID});
        },

        // 对方接受了呼叫
        onReceiveCallAccess: async function(targetID) {
            // 初始化对等连接对象
            this.initRTC();
            // 需要先挂载本地媒体，才能发送给对方
            await this.localAddMedia();
            // 创建offer，开始进行对等连接协调
            await this.offerTrans(targetID);
        },

        // 对方拒绝呼叫
        onReceiveCallRefuse: function() {
            // 跳转回上一页
            this.speakerBack('对方已拒绝');
        },

        // 开始呼叫：发送ping等待对方pong，然后协调连接
        start: async function(targetID) {
            this.ping(targetID);
            this.waitSetOffline();
        },

        // 开始对等端的协调（收到pong时调用）
        offerTrans: async function(targetID) {
            let offer;

            // 创建offer
            try {
                offer = await this.pc.createOffer(this.offerOptions);
                console.log('created offer');
            } catch (e) {
                console.log("create offer error", e);
                this.speakerBack('创建对等连接offer失败');
                return;
            }

            // 设置本地offer
            try {
                await this.pc.setLocalDescription(offer);
                console.log('set local SDP');
            } catch (e) {
                console.log("set local offer SDP err", e);
                this.speakerBack('设置本地对等连接offer失败');
                return;
            }

            // 发送offer给对方客户端（通过websocket中转）
            this.wsSendData(MsgTypeUser, ChildTypeUserOffer, targetID, offer);
        },

        // 收到offer时调用
        onReceiveOffer: async function(target, data) {
            // 那到offer设置远程SDP
            try {
                await this.pc.setRemoteDescription(data);
                console.log('set remote offer SDP');
            } catch (e) {
                console.log("set remote offer SDP err", e);
                this.speakerBack("设置远程对等连接offer失败");
                return;
            }

            // 创建answer响应对等端协调
            await this.answerTrans(target);

            // 显示本地媒体
            this.showLocalStream();
        },

        // answer交换
        answerTrans: async function(targetID) {
            let answer;

            // 创建answer
            try {
                console.log('create answer');
                answer = await this.pc.createAnswer();
            } catch (e) {
                console.log("create answer err", e);
                this.speakerBack("创建对等连接answer失败");
                return;
            }

            // 将answer设置为本地SDP
            try {
                await this.pc.setLocalDescription(answer);
                console.log('set local answer SDP');
            } catch (e) {
                console.log("set local answer SDP err", e);
                this.speakerBack("设置本地对等连接answer失败");
                return;
            }

            // 发送answer给对方客户端（通过websocket中转）
            this.wsSendData(MsgTypeUser, ChildTypeUserAnswer, targetID, answer)
        },

        // 收到answer时调用
        onReceiveAnswer: async function(data) {
            try {
                await this.pc.setRemoteDescription(data);
                console.log('set remote answer SDP');
            } catch (e) {
                console.log("set remote answer SDP err", e);
                this.speakerBack("设置远程对等连接answer失败");
                return;
            }

            this.showLocalStream();
        },

        // 收到ice消息时调用
        onReceiveICE: async function(targetID, data) {
            this.targetID = parseInt(targetID);
            if (data) {
                try {
                    await this.pc.addIceCandidate(data);
                    console.log('add ice candidate');
                } catch (e) {
                    console.log("set ice err", e);
                }
            }
        },

        // 当收到ice选举事件时，将ice消息发送给对方进行协调
        onIceCandidate: async function(pc, event) {
            try {
                console.log(`On ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
                this.wsSendData(MsgTypeUser, ChildTypeUserICE, this.targetID, event.candidate); // 发送ice
                console.log('send ice to target');
            } catch (e) {
                console.log("send ice to target err", e);
            }
        },

        // 挂机
        hangUp: function(targetID) {
            // 通知对方挂机
            this.wsSendData(MsgTypeUser, ChildTypeUserHangUp, targetID, {});

            // 本地处理
            this.onHangUp();

            router.push({'path':'/friends/friends'});
        },

        // 挂机的具体处理
        onHangUp: function() {
            console.log('hang up');
            if (this.pc) {
                this.pc.close();
                this.pc = null;
            }

            // 关闭本地媒体流
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    track.stop();
                });
            }

            // 取消视频显示
            this.localStream = null;
            this.remoteStream = null;
        },

        // ice状态变化
        onIceStateChange: function(pc, event) {
            if (pc) {
                console.log(`ICE state: ${pc.iceConnectionState}`);
                console.log('ICE state change event: ', event);
            }
        },

        // 收到远程数据流，进行显示
        gotRemoteStream: function(e) {
            console.log("got stream");
            // if (this.remoteStream.srcObject !== e.streams[0]) {
            //     this.remoteStream.srcObject = e.streams[0];
            //     console.log('received remote stream');
            // }
            this.remoteStream = e.streams[0];
            // this.setRemoteVideo(this.remoteStream);
            this.localOutPut = this.localStream;
            this.remoteOutPut = this.remoteStream;
        },

        // 显示本地视频流
        showLocalStream: function() {
            // this.localVideo.srcObject = this.localStream;
            // this.setLocalVideo(this.localStream);
        },

        getLocalOutPut: function () {
            return this.localOutPut;
        },

        getRemoteOutPut: function () {
            return this.remoteOutPut;
        }

        // // 设置本地视频设置方法
        // setLocalVideoFunc: function (func) {
        //     this.setLocalVideo = func;
        // },
        //
        // setRemoteVideoFunc: function (func) {
        //     this.setRemoteVideo = func;
        // }
    }
</script>
