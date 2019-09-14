import { Injectable, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from "moment";


export interface StreamState {
  playing: boolean;
  readableCurrentTime: string;
  readableDuration: string;
  duration: number | undefined;
  currentTime: number | undefined;
  canplay: boolean;
  error: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MediaPlayerService {
  private stop$ = new Subject();
  private audioPlayer= new Audio;
  private videoPlayer: any;
  private mediaType= 'audioPlayer';
  private state: StreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: 0,
    canplay: false,
    error: false,
  };
  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(
    this.state
  );
  audioEvents = [
    'load',
    'waiting',
    "progress",
    "ended",
    "error",
    "play",
    "playing",
    "pause",
    "timeupdate",
    "canplay",
    "loadedmetadata",
    "loadstart"
  ];

  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }
  
  play() {
    this[this.mediaType].play();
  }

  pause() {
    this[this.mediaType].pause();
  }

  stop() {
    this.stop$.next();
  }

  seekTo(seconds) {

    this[this.mediaType].currentTime =  parseFloat(seconds);
    console.log( this[this.mediaType].currentTime)
  }

  formatTime(time: number, format: string = "HH:mm:ss") {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  private streamObservable(file, videoElement?) {
   return new Observable(observer => {
      this.mediaType = `${file.type}Player`;
      if(file.type == 'video'){
        this[this.mediaType] = videoElement
        this[this.mediaType].play();
      }else{
        // Play audio
        this.audioPlayer.src =file.url;
        this.audioPlayer.load();
        this.audioPlayer.play();
      }
      
      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };

      this.addEvents(this[this.mediaType], this.audioEvents, handler);
      return () => {
        console.log('elimina events')
        // // Stop Playing
        // this.audioPlayer.pause();
        // this.audioPlayer.currentTime = 0;
        // // remove event listeners
        this.removeEvents(this[this.mediaType], this.audioEvents, handler);
        // console.log('resetea 1') 
        // // reset state
        this.resetState();
      };
    });
  }
  private loadStreamObservable(file, videoElement) {
    return new Observable(observer => {
      this.mediaType = `${file.type}Player`;
      if(file.type == 'video'){
        this[this.mediaType] = videoElement
      }else{
        // Load audio
        this.audioPlayer.src =file.url;
        this.audioPlayer.load();
      }
 
       const handler = (event: Event) => {
         this.updateStateEvents(event);
         observer.next(event);
       };
 
       this.addEvents(this[this.mediaType], this.audioEvents, handler);

       return () => {
        console.log('elimina events')
        // // Stop Playing
        // this.audioPlayer.pause();
        // this.audioPlayer.currentTime = 0;
        // // remove event listeners
        this.removeEvents(this[this.mediaType], this.audioEvents, handler);
        // console.log('resetea 1') 
        // // reset state
        this.resetState();
      };
     });
   }

  private addEvents(obj, events, handler) {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj, events, handler) {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }
  
  playStream(file, videoElement?) {
    return this.streamObservable(file, videoElement).pipe(takeUntil(this.stop$));
  }

  openFile(file, element?) {
    return this.loadStreamObservable(file, element).pipe(takeUntil(this.stop$));
  }

  private updateStateEvents(event: Event): void {
    switch (event.type) {
      case "canplay":
        this.state.duration = this[this.mediaType].duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case "playing":
        this.state.playing = true;
        break;
      case "pause":
        this.state.playing = false;
        break;
      case "timeupdate":
        this.state.currentTime =  this[this.mediaType].currentTime;
        this.state.readableCurrentTime = this.formatTime(
          this.state.currentTime
        );
        break;
      case "error":
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);
  }

  private resetState() {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false
    };
  }
}
