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
        "https://ia801504.us.archive.org/3/items/EdSheeranPerfectOfficialMusicVideoListenVid.com/Ed_Sheeran_-_Perfect_Official_Music_Video%5BListenVid.com%5D.mp3",
      name: "Perfect",
      artist: "Ed Sheeran",
      type: 'audio'
    },
    {
      url:
        "https://ia801609.us.archive.org/16/items/nusratcollection_20170414_0953/Man%20Atkiya%20Beparwah%20De%20Naal%20Nusrat%20Fateh%20Ali%20Khan.mp3",
      name: "Man Atkeya Beparwah",
      artist: "Nusrat Fateh Ali Khan",
      type: 'audio'
    },
    {
      url:
        'http://static.videogular.com/assets/videos/videogular.mp4',
      name: "Bunny",
      artist: "W3C",
      type: 'video'
    },
  
    {
      url:
      "https://ia801609.us.archive.org/16/items/nusratcollection_20170414_0953/Man%20Atkiya%20Beparwah%20De%20Naal%20Nusrat%20Fateh%20Ali%20Khan.mp3",
      name: "Penny Lane",
      artist: "The Beatles",
      type: 'audio'
    }
  ];
  state: StreamState;
  currentFile: any = {};
  preventRangeMovement = false;
  autoPlay = true;

  constructor(private mediaPlayerService : MediaPlayerService){
      // listen to stream state
      this.mediaPlayerService.getState().subscribe(state => {
        // this.state=state;
        if(!this.preventRangeMovement){
          this.state = Object.assign({},state);
          if(this.state.duration){
            this.currentFile.timerDuration = this.mediaPlayerService.formatTime(this.state.duration);
            this.currentFile.timerCurrentTime = this.mediaPlayerService.formatTime(this.state.currentTime);
          }
        }
      });
  }
  
  ngOnInit(): void {
    this.openFile(this.files[0], 0);
  }  

  getFiles() {
    return this.files;
  }

  async openFile(file, index, element?) {
    this.currentFile = { index, file };
    this.mediaPlayerService.stop();
    this.autoPlay=false;
    let mediaListener;
    // const event = await this.mediaPlayerService.openFile(file.url).toPromise().catch(err => { console.log(err)});
    if(file.type == 'video' && element){
      mediaListener = this.mediaPlayerService.openFile(file, element);
    }else if(file.type == 'audio'){
      mediaListener =  this.mediaPlayerService.openFile(file);
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
    console.log('PASO')
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

  playStream(file) {
    this.mediaPlayerService.playStream(file).subscribe(events => {
      // listening for fun here
    });
  }


  onProgressVideo(event){
    console.log(event)

  }

  play() {
    this.mediaPlayerService.play();
  }

  pause() {
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
    this.preventRangeMovement= false;
    this.mediaPlayerService.seekTo(event.target.value); 
  }

  rangeChanged(seconds){
    this.preventRangeMovement = true;
    this.state.currentTime = seconds;
    this.currentFile.timerCurrentTime = this.mediaPlayerService.formatTime(this.state.currentTime);
  }

  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    return this.currentFile.index === this.files.length - 1;
  }
}
