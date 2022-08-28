const podcasts = require('../controller/podcasts')
// const answers = require('../controller/answers')
// const questions = require('../controller/questions')
// const analytics = require('../controller/analytics')

const express = require('express');
const router = express.Router();
// const analytics = require('../controller/podcasts')

/* GET users listing. */
const v0 = '/api/v0'
router.get(v0 + '/searchpodcasts', (req, res) => {
    podcasts.searchpodcasts(req, res)
})
router.get(v0 + '/searchredispodcast', (req, res) => {
    podcasts.searchRedisPodcast(req, res)
})
router.get(v0 + '/addpodcastinredisgraph', (req, res) => {
    podcasts.addPodcastInRedisGraph(req, res)
})
router.post(v0 + '/podcastsFromCSV', (req, res) => {
    podcasts.podcastsFromCSV(req, res)
})
router.post(v0 + '/fetchPodcastsEpisodes', (req, res) => {
    podcasts.fetchPodcastsEpisodes(req, res)
})
router.post(v0 + '/recommendedPodcasts', (req, res) => {
    podcasts.recommendedPodcasts(req, res)
})
router.get(v0 + '/listpodcasts', (req, res) => {
    podcasts.listPodcasts(req, res)
})



module.exports = router;