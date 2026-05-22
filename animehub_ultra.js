(function () {

    Lampa.Plugin.register('animehub_ultra', function () {

        const API = 'https://shikimori.one/api/animes';

        // ===== STORAGE =====
        let fav = JSON.parse(localStorage.getItem('ah_fav') || '[]');
        let history = JSON.parse(localStorage.getItem('ah_history') || '[]');
        let progress = JSON.parse(localStorage.getItem('ah_progress') || '{}');

        function save() {
            localStorage.setItem('ah_fav', JSON.stringify(fav));
            localStorage.setItem('ah_history', JSON.stringify(history));
            localStorage.setItem('ah_progress', JSON.stringify(progress));
        }

        // ===== API =====
        function api(query = '') {
            return fetch(API + '?limit=20' + query)
                .then(r => r.json());
        }

        // ===== NETFLIX HOME =====
        function openHome() {

            Promise.all([
                api(),
                api('&order=popularity'),
                api('&order=ranked')
            ]).then(([latest, popular, top]) => {

                Lampa.Activity.push({
                    title: 'AnimeHub ULTRA',
                    component: 'category',
                    page: 1,
                    source: [
                        {
                            title: 'Continue Watching',
                            items: buildContinue()
                        },
                        {
                            title: '🔥 Latest',
                            items: cards(latest)
                        },
                        {
                            title: '⭐ Popular',
                            items: cards(popular)
                        },
                        {
                            title: '🏆 Top Rated',
                            items: cards(top)
                        },
                        {
                            title: '❤️ Favorites',
                            items: cards(fav)
                        }
                    ]
                });

            });

        }

        // ===== CARDS =====
        function cards(data) {
            return data.map(a => ({
                title: a.russian || a.name,
                subtitle: `${a.score || '?'} ★ • ${a.kind}`,
                image: a.image?.preview || '',
                data: a
            }));
        }

        // ===== CONTINUE WATCHING =====
        function buildContinue() {

            return Object.keys(progress).map(id => {

                const a = progress[id];

                return {
                    title: a.title,
                    subtitle: `Episode ${a.ep || 1}`,
                    image: a.image || '',
                    data: a
                };

            });

        }

        // ===== ANIME PAGE =====
        function openAnime(anime) {

            let isFav = fav.find(x => x.id === anime.id);
            let prog = progress[anime.id];

            history.push(anime.id);
            save();

            Lampa.Activity.push({
                title: anime.russian || anime.name,
                component: 'full',
                html: `
                    <div style="padding:20px">

                        <h2>${anime.russian || anime.name}</h2>

                        <img src="${anime.image?.original || ''}" style="width:100%;border-radius:12px"/>

                        <p style="margin-top:10px">${anime.description || ''}</p>

                        <br>

                        <b>Rating:</b> ${anime.score || 'N/A'}<br>
                        <b>Episodes:</b> ${anime.episodes || '?'}<br>

                        <br>

                        <button id="play">▶ Play</button>
                        <button id="next">⏭ Next episode</button>
                        <button id="fav">${isFav ? '💔 Remove' : '❤️ Favorite'}</button>

                    </div>
                `
            });

            setTimeout(() => {

                document.getElementById('play').onclick = () => play(anime, 1);

                document.getElementById('next').onclick = () => {
                    let ep = (prog?.ep || 1) + 1;
                    play(anime, ep);
                };

                document.getElementById('fav').onclick = () => {

                    if (isFav) {
                        fav = fav.filter(x => x.id !== anime.id);
                    } else {
                        fav.push(anime);
                    }

                    save();
                    Lampa.Noty.show('Updated favorites');
                    openAnime(anime);
                };

            }, 200);

        }

        // ===== PLAY SYSTEM =====
        function play(anime, episode = 1) {

            // save progress
            progress[anime.id] = {
                id: anime.id,
                title: anime.russian || anime.name,
                image: anime.image?.preview || '',
                ep: episode
            };

            save();

            // send to Lampa player (sources depend on installed plugins)
            Lampa.Player.play({
                title: `${anime.russian || anime.name} Episode ${episode}`,
                query: `${anime.russian || anime.name} ${episode}`,
                source: 'animehub_ultra'
            });

            Lampa.Noty.show(`Loading episode ${episode}`);

        }

        // ===== SEARCH =====
        function search() {

            Lampa.Input.edit({
                title: 'AnimeHub ULTRA search',
                free: true
            }, function (v) {

                api('&search=' + encodeURIComponent(v))
                    .then(data => {

                        Lampa.Activity.push({
                            title: 'Search results',
                            component: 'category',
                            page: 1,
                            source: cards(data)
                        });

                    });

            });

        }

        // ===== MENU =====
        function menu() {

            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: 'animehub_ultra',
                    type: 'trigger',
                    default: false
                },
                field: {
                    name: 'AnimeHub ULTRA',
                    description: 'Netflix anime + watch progress + player'
                },
                onChange: v => {
                    if (v) openHome();
                }
            });

        }

        // ===== INIT =====
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') {
                menu();
                Lampa.Noty.show('AnimeHub ULTRA loaded');
            }
        });

        // GLOBAL
        window.AnimeHub = {
            home: openHome,
            search: search
        };

    });

})();