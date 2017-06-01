angular
    .module('geneOntology')
    .component('geneOntology', {
        templateUrl: '/static/wiki/js/angular_templates/gene-ontology-view.html',
        bindings: {
            data: '<',
            goclass: '@',
            gene: '<'
        },
        controller: function ($location) {
            var ctrl = this;

            ctrl.$onInit = function () {
                if ($location.url().indexOf('authorized') !== -1) {
                    ctrl.auth = true;
                    console.log(ctrl.auth);
                } else {
                    ctrl.auth = false;
                    console.log(ctrl.auth);
                }
            };
        }
    });