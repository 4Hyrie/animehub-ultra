(function () {

    'use strict';

    window.animeHubUltra = function(Lampa) {
        
        console.log('AnimeHub ULTRA: Initializing...');

        // Check if Lampa exists
        if (!Lampa || !Lampa.Plugin) {
            console.error('AnimeHub ULTRA: Lampa not available');
            return false;
        }

        // Register catalog entry
        if (Lampa.MainPage && Lampa.MainPage.add) {
            try {
                Lampa.MainPage.add({
                    name: 'animehub_ultra',
                    title: '🎬 AnimeHub ULTRA',
                    icon: '🎬',
                    component: function() {
                        if (Lampa.Noty) {
                            Lampa.Noty.show('AnimeHub ULTRA');
                        }
                    }
                });
                console.log('AnimeHub ULTRA: Registered in MainPage');
                return true;
            } catch(e) {
                console.error('AnimeHub ULTRA: MainPage error', e);
            }
        }

        // Alternative: Try catalog
        if (Lampa.Catalog && Lampa.Catalog.add) {
            try {
                Lampa.Catalog.add({
                    name: 'animehub_ultra',
                    title: '🎬 AnimeHub ULTRA',
                    icon: '🎬',
                    component: 'animehub_ultra'
                });
                console.log('AnimeHub ULTRA: Registered in Catalog');
                return true;
            } catch(e) {
                console.error('AnimeHub ULTRA: Catalog error', e);
            }
        }

        return false;
    };

    // Try to register immediately
    if (window.Lampa) {
        window.animeHubUltra(window.Lampa);
    } else {
        // Wait for Lampa to load
        document.addEventListener('DOMContentLoaded', function() {
            if (window.Lampa) {
                window.animeHubUltra(window.Lampa);
            }
        });
    }

})();