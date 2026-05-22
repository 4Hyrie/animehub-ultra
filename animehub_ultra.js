(function () {

    if (typeof Lampa === 'undefined') return;

    Lampa.Plugin.register('animehub_ultra', function (Lampa) {

        // ===== REGISTRATION IN LEFT MENU =====
        function initCatalog() {
            if (Lampa.Settings && Lampa.Settings.addShortcut) {
                Lampa.Settings.addShortcut({
                    name: 'animehub_ultra',
                    title: '🎬 AnimeHub ULTRA',
                    description: 'Anime catalog',
                    icon: '🎬',
                    action: function() {
                        Lampa.Noty.show('AnimeHub ULTRA');
                    }
                });
            }
        }

        // ===== INIT =====
        try {
            initCatalog();
            console.log('AnimeHub ULTRA: Loaded');
        } catch (e) {
            console.error('AnimeHub error:', e);
        }

    });

})();