"use strict";

var app = {};

app.repository = (function(){

    var _has_storage, _note_data = {}, _STORAGE = "localStorage";

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
            note.id = Date.now() + '-' + note.title.replace(/[^\w\s]/gi, '');
        }

        _note_data[note.id] = note;

        persist();
        console.log(note);
    }

    var deleteNote = function(id){
        delete _note_data[id];
        persist();
    }

    var loadNote = function(id){
        var note = _note_data[id];
        return note;
    }

    var persist = function(){
        if(hasStorage()){
            window[_STORAGE].setItem("notes_app_data", JSON.stringify(_note_data));
        }
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
        save: saveNote,
        delete: deleteNote,
        load: loadNote
    }

})();

app.notes = (function(){
    var _page,
        _template,
        _editing,
        _notes = [];

    var load_notes = function(){
        return app.repository.all();
    };

    var process_form = function(event){
        event.preventDefault();

        var note = _editing || {};
        
        note.title = _page.getElementById("note-title").value;
        note.categories = _page.getElementById("note-categories").value;
        note.important = _page.getElementById("crit-check").checked;
        note.due_date = _page.getElementById("due-by").value;
        note.body = _page.getElementById("note-body").value;

        save_note(note);
    }

    var clear_form = function(event){
        event.preventDefault();
        
        _editing = undefined;
        _page.getElementById("note-title").value = '';
        _page.getElementById("note-categories").value = '';
        _page.getElementById("crit-check").checked = false;
        _page.getElementById("due-by").value = '';
        _page.getElementById("note-body").value = '';
    }

    var save_note = function(note){
        app.repository.save(note);
//        display_note(note);
        _editing = note;
        render_notes(load_notes());
    };

    var edit_note = function(id){
        var note = app.repository.load(id);
        _editing = note;
        
        _page.getElementById("note-title").value = note.title;
        _page.getElementById("note-categories").value = note.categories;
        _page.getElementById("crit-check").checked = note.important;
        _page.getElementById("due-by").value = note.due_date;
        _page.getElementById("note-body").value = note.body;
    }

    var delete_note = function(id){
        app.repository.delete(id);

        var row = _page.getElementById(id);
        row.parentNode.removeChild(row);
    }

    var display_note = function(note){
        console.log(note);
        var row, table;
        row = apply_template(note);

        table = _page.getElementById("note-display");

        table.innerHTML += row;
    }

    var render_notes = function(notes){
        var i, table, note, rows = '';

        for(i = 0; i < notes.length; i++){
            note = notes[i];
            rows += apply_template(note);
        }
        
        table = _page.getElementById("note-display");

        if(rows){
            table.innerHTML = rows;
        }
    };

    var apply_template = function(obj){
        var t_html = _template.innerHTML;

        t_html = t_html.replace(/{{ title }}/g, obj["title"] ? obj["title"] : '') 
                .replace(/{{ id }}/g, obj["id"])
                .replace(/{{ important }}/g, obj["important"] ? 'x' : '') 
                .replace(/{{ due_date }}/g, obj["due_date"] ? obj["due_date"] : '') 
                .replace(/{{ categories }}/g, obj["categories"] ? obj["categories"] : '');

        return t_html;
    };  

    return{
        init: function(dom){
            _page = dom;
            _template = dom.getElementById("note-row-template")

            _page.getElementById("save-note-btn").addEventListener("click", process_form);
            _page.getElementById("clear-note-btn").addEventListener("click", clear_form);

            _notes = load_notes();

            render_notes(_notes);
        },
        handle_delete: function(id){
            console.log("Delete - " + id);
            delete_note(id);
        },
        handle_load: function(id){
            console.log("Load - " + id);
            edit_note(id);
        }
    }
})();

document.addEventListener("DOMContentLoaded", function(event) {
    app.notes.init(event.target);
});