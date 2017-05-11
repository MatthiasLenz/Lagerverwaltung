angular.module('baseApp')
.filter('total', function () {
    return function (input, property) {
        var i = input instanceof Array ? input.length : 0;
        if (typeof property === 'undefined' || i === 0) {
            return i;
        } else if (isNaN(input[0][property])) {
            console.log(input);
            throw 'filter total can count only numeric values';
        } else {
            var total = 0;
            while (i--)
                total += input[i][property];
            return total;
        }
    };
})
.filter('total_indirect', function () {
    return function (input, properties) {
        var i = input instanceof Array ? input.length : 0;
        if (typeof properties === 'undefined' || i === 0) {
            return i;
        } else if (isNaN( input[0] [properties[0]] [properties[1]] )) {
            console.log(input);
            throw 'filter total can count only numeric values';
        } else {
            var total = 0;
            while (i--)
                total += input[i] [properties[0]] [properties[1]];
            return total;
        }
    };
})
.filter('makeUppercase', function () {
  return function (item) {
    return item.toUpperCase();
  };
})
.filter('orFilter', function() {
    return function(machines, search) {
        let out = [];
        if (machines.length === 0) return out;
        for (let i=0; i<machines.length; i++){
            let machine = machines[i];
            if  ( machine.id.startsWith(search) ||
            (machine.name1 !== null && machine.name1.toLowerCase().includes(search.toLowerCase())) ||
            (machine.chassisnum !== null && machine.chassisnum.startsWith(search)) ||
            (machine.availabilitystatus !== null && machine.availabilitystatus.includes(search))){
                out.push(machine);
            }
        }
        return out;
    }
});