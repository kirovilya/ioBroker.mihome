'use strict';

function VibrationSensor(sid, ip, hub, model) {
    this.type         = model;
    this.sid          = sid;
    this.ip           = ip;
    this.hub          = hub;
    this.vibration    = null;
    this.orientationX = null;
    this.orientationY = null;
    this.orientationZ = null;
    this.bed_activity = null;
    this.tilt_angle   = null;
    this.voltage      = null;
    this.percent      = null;
}

VibrationSensor.prototype.getData = function (data, isHeartbeat) {
    let newData = false;
    let obj = {};
    if (data.voltage !== undefined) {
        data.voltage = parseInt(data.voltage, 10);
        this.voltage = data.voltage / 1000;
        this.percent = ((data.voltage - 2200) / 10);
        if (this.percent > 100) {
            this.percent = 100;
        }
        if (this.percent < 0) {
            this.percent = 0;
        }
        obj.voltage  = this.voltage;
        obj.percent  = this.percent;
        newData = true;
    }
    if (data.status && !isHeartbeat) {
        this.vibration = data.status === 'vibration';
        obj.state   = this.vibration;
        newData     = true;
    }
    if (data.final_tilt_angle !== undefined) {
        this.tilt_angle = parseInt(data.final_tilt_angle, 10);
        obj.tilt_angle  = this.tilt_angle;
        newData         = true;
    }
    if (data.coordination !== undefined) {
        const parts = data.coordination.split(',').map(num => parseInt(num.trim()));
        this.orientationX = parts[0];
        this.orientationY = parts[1];
        this.orientationZ = parts[2];
        obj.orientationX  = this.orientationX;
        obj.orientationY  = this.orientationY;
        obj.orientationZ  = this.orientationZ;
        newData         = true;
    }
    if (data.bed_activity !== undefined) {
        this.bed_activity = parseInt(data.bed_activity, 10);
        obj.bed_activity  = this.bed_activity;
        newData           = true;
    }
    return newData ? obj : null;
};

VibrationSensor.prototype.heartBeat = function (token, data) {
    if (data) {
        const obj = this.getData(data, true);
        if (obj) {
            this.hub.emit('data', this.sid, this.type, obj);
        }
    }
};
VibrationSensor.prototype.onMessage = function (message) {
    if (message.data) {
        const obj = this.getData(message.data);
        if (obj) {
            this.hub.emit('data', this.sid, this.type, obj);
        }
    }
};

module.exports = VibrationSensor;
