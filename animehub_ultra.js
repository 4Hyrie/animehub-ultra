// AnimeHub ULTRA - Anime Catalog
(function () {
    "use strict";

    Lampa.Lang.add({
        animehub_title: {
            ru: "AnimeHub ULTRA",
            en: "AnimeHub ULTRA",
            uk: "AnimeHub ULTRA",
            be: "AnimeHub ULTRA",
            zh: "AnimeHub ULTRA",
            pt: "AnimeHub ULTRA",
            bg: "AnimeHub ULTRA"
        }
    });

    function animehub_component(object) {
        this.create = function () { };
        this.build = function () { };
        this.start = function () { };
        this.pause = function () { };
        this.stop = function () { };
        this.render = function () { };
        this.destroy = function () { };
    }

    function add() {
        var ico = '🎬';
        var menu_items = $(
            '<li class="menu__item selector" data-action="animehub_ultra"><div class="menu__ico">' +
            ico +
            '</div><div class="menu__text">' +
            Lampa.Lang.translate("animehub_title") +
            "</div></li>"
        );

        menu_items.on("hover:enter", function () {
            if (Lampa.Noty) {
                Lampa.Noty.show("AnimeHub ULTRA loaded");
            }
        });

        $(".menu .menu__list").eq(0).append(menu_items);
    }

    function createAnimeHub() {
        window.plugin_animehub_ready = true;
        Lampa.Component.add("animehub_component", animehub_component);
        
        if (window.appready) {
            add();
        } else {
            Lampa.Listener.follow("app", function (e) {
                if (e.type == "ready") {
                    add();
                }
            });
        }
    }

    if (!window.plugin_animehub_ready) {
        createAnimeHub();
    }
})();