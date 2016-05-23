/*
* Airtight Utilities 
* v 0.1.1
* @author felixturner / http://airtight.cc/
*/

ATUtil = {
	randomRange : function(min, max) {
		return min + Math.random() * (max - min);
	},
	randomInt : function(min,max){
		return Math.floor(min + Math.random() * (max - min + 1));
	},
	map : function(value, min1, max1, min2, max2) {
		return ATUtil.lerp( ATUtil.norm(value, min1, max1), min2, max2);
	},
	lerp : function(value, min, max){
		return min + (max -min) * value;
	},
	norm : function(value , min, max){
		return (value - min) / (max - min);
	},
	shuffle : function(o) {
		for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	},
	randomVector3: function(range){
		return new THREE.Vector3(ATUtil.randomRange(-range,range),ATUtil.randomRange(-range,range),ATUtil.randomRange(-range,range));
	}
};