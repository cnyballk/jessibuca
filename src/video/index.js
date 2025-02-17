import CanvasVideoLoader from './canvasLoader';
import VideoLoader from "./videoLoader";

export default class Video {
    constructor(player) {
        const Loader = Video.getLoaderFactory(player._opt);
        return new Loader(player);
    }

    static getLoaderFactory(opt) {
        if (opt.useMSE ||
            (opt.useWCS && !opt.useOffscreen && opt.wcsUseVideoRender)) {
            return VideoLoader;
        } else {
            return CanvasVideoLoader;
        }
    }
}
