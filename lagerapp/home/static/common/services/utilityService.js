/**
 * Created by matthias.lenz on 10.05.2017.
 */
angular.module('baseApp.Services').
factory("utilityService", function ($interval) {

    function getRandomid() {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return Math.random().toString(36).substr(2, 9);
    }

    var dotVariants = ['    ', '.   ', '..  ', '... ', '....'];
    var dots = {value: '    '};
    var i = 0;
    $interval(function () {
        i = (i + 1) % dotVariants.length;
        dots.value = dotVariants[i];
        window.countellipsis +=1;
    }, 600);

    return {
        randomid: getRandomid,
        dots:  dots
    };
});