"use strict";

var app = {};

app.repository = (function(){

    var _has_storage, _note_data = {}, _STORAGE = "sessionStorage";

    var loadAll = function(){
        var data, arr = [];
        if(hasStorage()){
            data = JSON.parse(window[_STORAGE].getItem("notes_app_data"));
            if(data != null){
                _note_data = data;
            }
        }

        for(var k in _note_data){
            if(_note_data.hasOwnProperty(k)){
                arr.push(_note_data[k]);
            }
        }

        return arr;
    };

    var saveNote = function(note){
        if(typeof note.id === 'undefined'){
            note.id = Date.now() + '-' + note.title;
        }

        _note_data[note.id] = note;

        if(hasStorage()){
            window[_STORAGE].setItem("notes_app_data", JSON.stringify(_note_data));
        }
        console.log(note);
    }

    var hasStorage = function(){
        if(_has_storage){
            return _has_storage;
        }
        try{
            var storage = window[_STORAGE];
            var temp = "__" + _STORAGE + "_test__";
            storage.setItem(temp, temp);
            storage.removeItem(temp);
            _has_storage = true;
            return true;
        }
        catch(e){
            _has_storage = false;
            return false;
        }
    }

    return {
        all: loadAll,
        save: saveNote
    }

})();

app.notes = (function(){
    var _page,
        _notes = [];

    var load_notes = function(){
        return app.repository.all();

    };

    var process_form = function(event){
        event.preventDefault();
        var note = {};
        
        note.title = _page.getElementById("note-title").value;
        note.categories = _page.getElementById("note-categories").value;
        note.important = _page.getElementById("crit-check").checked;
        note.due_date = _page.getElementById("due-by").value;
        note.body = _page.getElementById("note-body").value;

        save_note(note);
    }

    var save_note = function(note){
        app.repository.save(note);
    };

    return{
        init: function(dom){
            _page = dom;

            var btn = dom.getElementById("save-note-btn");
            btn.addEventListener("click", process_form);

            _notes = load_notes();
            console.log(_notes);
        }
    }
})();

document.addEventListener("DOMContentLoaded", function(event) {
    app.notes.init(event.target);
});