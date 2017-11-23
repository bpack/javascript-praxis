"use strict";

document.addEventListener("DOMContentLoaded", function(event) {
    praxis.init(event.target);
});

(function(praxis, undefined){

    var _cardlist = [];
    var _template;
    var _errorspan;
    var _userfield;

    praxis.init = function(document){
        var submit = document.getElementById("load_button");
        submit.addEventListener('click', this.handleSubmit);

        _userfield = document.getElementById("username");
        _template = document.getElementById("card-template");
        _errorspan = document.getElementById("error-span");
    };

    praxis.handleSubmit = function(event){
        event.preventDefault(true);

        var username = _userfield.value;
        if(username){
            praxis.get("https://api.github.com/users/" + username, praxis.handleResponse);
        }
    };

    praxis.handleResponse = function(res){
        _errorspan.innerHTML = '';

        var target = res.target;
        if(target.readyState === XMLHttpRequest.DONE){
            if(target.status === 200){
                praxis.loadUser(res);
                _userfield.value = '';
            }
            else {
                praxis.handleError(res);
            }
        }

    }

    praxis.loadUser = function(res){
        var user = JSON.parse(res.target.response);

        if(!praxis.inCardList(user)){
            _cardlist.push(user);
            var html = praxis.applyTemplate(user);

            var list = document.getElementById("cardlist");
            list.innerHTML = list.innerHTML + html;
        }
        else {
            console.log("User " + user.name + " already in card list.");
        }
    };

    praxis.inCardList = function(user) {

        return _cardlist.reduce(function(found, current){
                return found || current.id === user.id;
        }, false);

    }

    praxis.handleError = function(res){
        var msg = '';

        if(res.target.status === 404){
            var url = res.target.responseURL;
            var user = url.substring(url.lastIndexOf('/') + 1);

            msg = "User [" + user + "] not found";
        }
        else {
            msg = "An error occurred";
        }
        _errorspan.innerHTML = msg;
    }

    praxis.applyTemplate = function(obj){
        var t_html = _template.innerHTML;

        t_html = t_html.replace(/{{ name }}/g, obj["name"] ? obj["name"] : '')
                .replace(/{{ avatar_url }}/g, obj["avatar_url"] ? obj["avatar_url"] : '')
                .replace(/{{ location }}/g, obj["location"] ? obj["location"] : '')
                .replace(/{{ created_at }}/g, function replacer(match){
                    if(obj["created_at"]){
                        return obj["created_at"].substring(0, 10);
                    }
                });

        return t_html;
    };

    praxis.get = function(url, listener){
        var req = new XMLHttpRequest();
        req.addEventListener('load', listener);
        req.open("GET", url);
        req.send();
    };

}(window.praxis = window.praxis || {}));