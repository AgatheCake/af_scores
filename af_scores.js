#!/usr/bin/env node

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

app.use(cors());

const SCORES = [
    {name: 'Touchdown', value: 6},
    {name: 'Field Goal', value: 3},
    {name: 'PAT', value: 1},
];

function findCombinations(targetScore) {
    let results = [];

    function backtrack(remaining, path, lastWasTD) {
        if (remaining === 0) {
            results.push(path.join(' + '));
            return;
        }
        if (remaining < 0) return;

        for (let {name, value} of SCORES) {
            if (name === 'PAT' && !lastWasTD) continue;
            backtrack(remaining - value, [...path, name], name === 'Touchdown');
        }
    }

    backtrack(targetScore, [], false);
    return results;
}

const MAX_SCORE = 55;
const NO_POSSIBILITIES_MESSAGE = 'No combinations for this score';

app.get('/combinations', (req, res) => {
    const score1 = parseInt(req.query.team1, 10);
    const score2 = parseInt(req.query.team2, 10);

    if (isNaN(score1) || isNaN(score2)) {
        return res
            .status(400)
            .json({error: 'The scores must be valid numbers'});
    }

    if (score1 > MAX_SCORE || score2 > MAX_SCORE) {
        return res.status(400).json({
            error: `The API cannot support a score higher than ${MAX_SCORE}`,
        });
    }

    const combinations1 = findCombinations(score1);
    const combinations2 = findCombinations(score2);

    res.json({
        team1: combinations1.length
            ? combinations1
            : [NO_POSSIBILITIES_MESSAGE],
        team2: combinations2.length
            ? combinations2
            : [NO_POSSIBILITIES_MESSAGE],
    });
});

app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
});
