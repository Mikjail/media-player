import { Component, ViewChild, ElementRef } from '@angular/core';
import { StreamState, MediaPlayerService } from './service/media-player.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('myVideo',{ static: false}) videoplayer: ElementRef;
  files: Array<any>  = [
    {
      url:
      "https://ia801609.us.archive.org/16/items/nusratcollection_20170414_0953/Man%20Atkiya%20Beparwah%20De%20Naal%20Nusrat%20Fateh%20Ali%20Khan.mp3",
      name: "Perfect",
      artist: "Nusrat Fateh Ali Khan",
      type: 'audio',
      duration: 868.440816
    }
  ];
  state: StreamState;
  currentFile: any = {
    index: 0,
    currentTime:0,
    file: undefined
  };
  chunkMap=[];
  paused = true;
  valueToSeek = 0;
  loadNewChunk= true;
  preventRangeMovement = false;  
  autoPlay = true;

  constructor(private mediaPlayerService : MediaPlayerService){
      // listen to stream state
      this.mediaPlayerService.getState().subscribe(state => {
        if(!this.preventRangeMovement){
          this.state = Object.assign({},state);
          if(this.currentFile.index === 0){
            this.currentFile.timerCurrentTime =this.mediaPlayerService.formatTime(state.currentTime);
            this.currentFile.currentTime = state.currentTime;
          }else{
            if(this.chunkMap[this.currentFile.index]){
              // this.currentFile.timerCurrentTime = this.mediaPlayerService.formatTime(this.chunkMap[this.currentFile.index].duration - this.currentFile.currentTime); 
            }
          }
        }
      });
  }
  
  ngOnInit(): void {
    this.openFile(this.files[0], 0);
    this.calculateDuration();
  }  

  getFiles() {
    return this.files;
  }

  calculateDuration(){
    this.currentFile.duration = 0;
    this.files.forEach( (elem, index) =>{
      this.currentFile.duration += elem.duration;
      const seg = this.mediaPlayerService.formatTime(elem.duration);
      this.chunkMap.push({duration :this.currentFile.duration, active: index == 0 ? true : false})
    })
    this.currentFile.timerDuration = this.mediaPlayerService.formatTime(this.currentFile.duration);
  }

  async openFile(file, index, element?, valueToSeek?) {
    this.currentFile.index = index;
    this.currentFile.file = file;
    this.mediaPlayerService.stop();
    this.autoPlay=false;
    let mediaListener;
    // const event = await this.mediaPlayerService.openFile(file.url).toPromise().catch(err => { console.log(err)});
    if(file.type == 'video' && element){
      mediaListener = this.mediaPlayerService.openFile(file, element);
    }else if(file.type == 'audio'){
      mediaListener =  this.mediaPlayerService.openFile(file, null, valueToSeek);
    }
    if(mediaListener){
      mediaListener.subscribe((events: any) => {
        // listening for fun here
        if(events.type =="canplay"){
          
        }
        if(events.type =="ended" && !this.isLastPlaying()){
          this.next();
        }
      });
    }
   
  }

  loadedVideo(event){
    if(this.autoPlay){
      this.mediaPlayerService.playStream(this.currentFile.file, this.videoplayer.nativeElement).subscribe((events: any) => {
        // listening for fun here
        if(events.type =="ended" && !this.isLastPlaying()){
          this.next();
        }
      });
    } else {
      this.openFile(this.currentFile.file, this.currentFile.index, this.videoplayer.nativeElement);
    }
  }

  playStream(file, seekTo?) {
    this.mediaPlayerService.playStream(file, null, seekTo).subscribe(events => {
      // listening for fun here
    });
  }


  onProgressVideo(event){
    console.log(event)

  }

  play() {
    this.paused = false;
    this.mediaPlayerService.play();
  }

  pause() {
    this.paused = true;
    this.mediaPlayerService.pause();
  }

  stop() {
    this.mediaPlayerService.stop();
  }

  next() {
    const index = this.currentFile.index + 1;
    const file = this.files[index];
    this.currentFile.file = this.files[index];
    this.currentFile.index = index
    this.autoPlay = true;
    if(file.type === 'audio'){
      this.playStream(file);
    }
  }

  previous() {
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    this.openFile(file, index);
  }

  onSliderChange(event) {
    const index =  this.chunkMap.findIndex(elem => elem.active);
    let valueToSeek =event.target.value;
    this.preventRangeMovement= false;
    if(this.currentFile.index != index ){
      valueToSeek =this.chunkMap[index].duration - event.target.value;
      this.currentFile.index = index;
      this.currentFile.file = this.files[index];
      if(this.paused){
        this.openFile(this.files[index], index, valueToSeek);
      }else{
        this.playStream(this.files[index], valueToSeek);
      }
      
    }else{
      this.mediaPlayerService.seekTo(valueToSeek); 
    }
  }

  rangeChanged(seconds){
    this.preventRangeMovement = true;
    this.chunkMap.forEach( (chunk, index) =>{
      if(index == 0 && seconds <= chunk.duration){
        chunk.active= true
      }else if(index > 0 && seconds < chunk.duration &&  seconds >= this.chunkMap[index-1].duration){
        chunk.active= true;
      }else {
          chunk.active=false
      }
    })
    this.currentFile.currentTime=seconds;
    this.currentFile.timerCurrentTime = this.mediaPlayerService.formatTime(this.currentFile.currentTime);
  }

  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    return this.currentFile.index === this.files.length - 1;
  }
}
