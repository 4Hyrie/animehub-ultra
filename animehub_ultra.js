Lampa.Plugin.register('animehub_ultra', function() {

    Lampa.MainPage.add({
        name: 'animehub_ultra',
        title: '🎬 AnimeHub ULTRA',
        description: 'Anime catalog',
        icon: '🎬',
        component: function() {
            Lampa.Activity.push({
                title: '🎬 AnimeHub ULTRA',
                component: 'full',
                html: '<div style="padding:20px;color:#fff"><h1>Welcome to AnimeHub ULTRA</h1><p>Coming soon...</p></div>'
            });
        }
    });

});