import CachedData from "./CachedData.js";

/**
 * A version of {@link CachedData} that loads the game setup data.
 */
export default class GameData extends CachedData {

    /**
     * @inheritDoc
     */
    static create() {
        return new this("./assets/data/game.json");
    }

    /**
     * Gets the row of data for the given number of players.
     *
     * @param  {Number} players
     *         Number of players in this game.
     * @return {Promise}
     *         A promise that resolves with the correct data for the given
     *         number of players.
     */
    getRow(players) {

        return this.then((data) => {
            return data[Math.min(players - 5, data.length - 1)];
        });

    }

}
