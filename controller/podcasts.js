
const podcasts = require("../services/podcasts");
const routes = {}
routes.searchpodcasts = (req, res) => {
    podcasts.searchpodcasts(req, res)
}
routes.searchRedisPodcast = (req, res) => {
    podcasts.searchRedisPodcast(req, res)
}
routes.addPodcastInRedisGraph = (req, res) => {
    podcasts.addPodcastInRedisGraph(req, res)
}
routes.podcastsFromCSV = (req, res) => {
    podcasts.podcastsFromCSV(req, res)
}
routes.fetchPodcastsEpisodes = (req, res) => {
    podcasts.fetchPodcastsEpisodes(req, res)
}
routes.recommendedPodcasts = (req, res) => {
    podcasts.recommendedPodcasts(req, res)
}
routes.listPodcasts = (req, res) => {
    podcasts.listPodcasts(req, res)
}

module.exports = routes