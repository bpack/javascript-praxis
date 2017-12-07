
document.addEventListener("DOMContentLoaded", function(event){
    calculator.init(event.target);
});

(function(calculator, undefined){
    var _accum = 0;
    var _current = 0;
    var _display = '';
    var _field;
    var _active;

    var _ops = {}; 

    calculator.init = function(dom){

        var buttons = dom.querySelectorAll(".btn");
        for(var i = 0; i < buttons.length; i++){
            var b = buttons[i];
            b.addEventListener('transitionend', this.removeTransition);
            b.addEventListener('click', this.buttonActivated);
        }

        _ops = this.loadOps();

        _field = dom.getElementById("display");
        _field.value = '0';
    };

    calculator.removeTransition = function(transition){
        if(transition.propertyName !== "transform") { return; }

        this.classList.remove("activate");
    };


    calculator.buttonActivated = function(event){

        var btn = event.target;
        btn.classList.add("activate");

        var op = btn.innerHTML;
        calculator.handleInput(op);
    }

    calculator.handleInput = function(val){

        if(!isNaN(val)) {    // Alternate +val === +val
            _display += val;
            _field.value = _display;
        }
        else {
            var op = _ops[val]();

            _current = Number(_field.value);

            if(op.type === 'unary'){
                var result = op(_current);
                if(result){
                    _display = result;
                    _field.value = _display;
                }

                return;
            }
            else if(_display !== '') {
                console.log('current = ' + _current + ", accumulator = " + _accum);

                if(_active && typeof _active === 'function'){
                    calculator.evalutate();
                }
                else {
                    _accum = _current;
                }
                _display = '';
            }

            _active = op;
        }
    }

    calculator.evalutate = function(){
        if(_active && typeof _active === 'function'){
            var result = _active(_accum, _current);
            console.log(_accum + ' ' + _active.name + ' ' + _current + ' = ' + result);
            _accum = result;
            _field.value = result;
            _current = 0;

            _active = undefined;
        }
    }

    calculator.loadOps = function() {
        return {
            'C': function(){
                var clear = function(){
                    _active = undefined;
                    _accum = 0;
                    _current = 0;
                    _display = '';
                    _field.value = '0';
                };
                clear.type = 'unary';

                return clear;
            },
            '+': function(){
                var add = function(a, b){
                    return a + b;
                };
                add.type = 'binary';
                return add;
            },
            '-': function(){
                var minus = function(a, b){
                    return a - b;
                };
                minus.type = 'binary';
                return minus;
            },
            'x': function(){
                var mult = function(a, b){
                    return a * b;
                };
                mult.type = 'binary';
                return mult;
            },
            '/': function() {
                var div = function(a, b){
                    return a / b;
                };
                div.type = 'binary';
                return div;
            },
            '.': function(){
                var decimal = function(){
                    _display += '.';
                    _field.value = _display;
                };
                decimal.type = 'unary';
                return decimal;
            },
            '=': function(){
                var eq = function() {
                    calculator.evalutate();
                    _display = '';
                }
                eq.type = 'unary';
                return eq;
            },
            '%': function(){
                var percent = function(a){
                    return a / 100.0;
                }
                percent.type = 'unary';
                return percent;
            },
            '√': function(){
                var sqrt = function(a){
                    return Math.sqrt(a);
                };
                sqrt.type = 'unary';
                return sqrt;
            },
            '±': function(){
                var inverse = function(a){
                    return a = a * -1;
                }
                inverse.type = 'unary';
                return inverse;
            }

        }
    

    }

}(window.calculator = window.calculator || {}));