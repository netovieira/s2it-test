'use strict';

var app = angular.module('S2TiTestApp', ['ngStorage']);

app.controller('S2TiTestCtrl', function($localStorage, $scope, $rootScope){

    $scope.releases = [];
    $scope.release = {};
    $scope.total = 0;

    $scope.FocusMe = true;

    $scope.$watch(
        "FocusMe",
        function (newValue) {
            if (newValue) {
                setTimeout( function () {
                    $scope.FocusMe = false;
                },
                50);
            }
        }
    );

    $scope.$watchCollection(
        "releases",
        function () {
            sumReleases();
        },
        true
    );


    $scope.sortType     = 'index';
    $scope.sortReverse  = false;

    $scope.addRelease = function () {
        console.log($scope.ItemTemplates);
        $scope.release.template = 'readonly';
        $scope.release.index = $scope.releases.length;
        $scope.releases.push($scope.release);
        $scope.release = {};
        $scope.FocusMe = true;
        sumReleases();
    };

    $scope.removeRelease = function (index) {
        $scope.releases.splice(index, 1);
        setIndex();
        sumReleases();
    };

    $scope.editRelease = function (index) {
        $scope.releases[index].template = 'edit';
    };

    $scope.saveRelease = function (index) {
        $scope.releases[index].template = 'readonly';
        sumReleases();
    };

    $scope.getTemplate = function(name) {
        return '/app/templates/'+name+'.html';
    };

    function setIndex() {
        for( var i = 0; i < $scope.releases.length; i++){
            $scope.releases[i].index = i;
        }
    };

    function sumReleases() {
        $scope.total = 0;
        for( var i = 0; i < $scope.releases.length; i++){
            var r = $scope.releases[i];
            if ( r.type == 'Saque'){
                $scope.total -= r.value;
            }else if ( r.type == 'Depósito'){
                $scope.total += r.value;
            }

        }
    };

});

app.directive('setFocus', function($timeout) {
    return {
        scope: { trigger: '@setFocus' },
        link: function(scope, element) {
            scope.$watch('trigger', function(value) {
                if(value === "true") {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
        }
    };
});