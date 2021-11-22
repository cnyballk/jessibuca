import Emitter from "../utils/emitter";
import {EVENTS, EVENTS_ERROR} from "../constant";
import {calculationRate} from "../utils";

export default class FetchLoader extends Emitter {
    constructor(player) {
        super();
        this.player = player;
        this.playing = false;

        this.abortController = new AbortController();

        //
        this.streamRate = calculationRate(rate => {
            player.emit(EVENTS.streamRate, rate);
        });
        player.debug.log('FetchStream', 'init');
    }


    fetchStream(url) {
        const {demux} = this.player;
        fetch(url, {signal: this.abortController.signal}).then((res) => {
            const reader = res.body.getReader();
            this.emit(EVENTS.streamSuccess);
            const fetchNext = () => {
                reader.read().then(({done, value}) => {
                        if (done) {
                            demux.close();
                        } else {
                            this.streamRate(value.byteLength);
                            this.playing = true;
                            demux.dispatch(value);
                            fetchNext();
                        }
                    }
                ).catch((e) => {
                    demux.close();
                    this.playing = false;
                    // 这边会报用户 aborted a request 错误。
                    this.emit(EVENTS_ERROR.fetchError, e);
                })
            }
            fetchNext();
        }).catch((e) => {
            this.emit(EVENTS_ERROR.fetchError, e)
        })
    }


    destroy() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null
        }
        this.streamRate = null;
    }
}
