import AgoraRTC, {
  IAgoraRTCClient,
  UID,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
  IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng'
import {Dispatch} from 'redux'

import {meetingSlice} from 'redux/reducers'

export type RtcUID = UID
export type RtcUser = IAgoraRTCRemoteUser
export type RtcMediaType = 'video' | 'audio'
export type RtcCameraVideoTrack = ICameraVideoTrack
export type RtcMicrophoneAudioTrack = IMicrophoneAudioTrack
export type RtcRemoteVideoTrack = IRemoteVideoTrack

export interface Attendee {
  user: IAgoraRTCRemoteUser
  hasSubscribedVideo: boolean
  hasSubscribedAudio: boolean
}

export class RTCClient {
  dispatch: Dispatch
  client: IAgoraRTCClient
  selfUid: UID | null
  selfAudioTrack: IMicrophoneAudioTrack | null
  selfVideoTrack: ICameraVideoTrack | null
  attendeeMap: Record<string, Attendee>

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch
    this.client = AgoraRTC.createClient({mode: 'rtc', codec: 'h264'})
    this.selfUid = this.selfAudioTrack = this.selfVideoTrack = null
    this.attendeeMap = {}
  }

  async join(appId: string, channelName: string, token: string) {
    this.selfUid = await this.client.join(appId, channelName, token, null)
    this.client.on('user-published', this.handleUserPublish)
    this.client.on('user-unpublished', this.handleUserUnpublish)
    this.client.on('user-left', this.handleUserLeft)

    this.selfAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    this.selfVideoTrack = await AgoraRTC.createCameraVideoTrack()

    // Video for 7+ Users
    this.client.setLowStreamParameter({
      width: 120,
      height: 120,
      framerate: 15,
      bitrate: 120,
    })
    this.client.enableDualStream()
    this.client.setRemoteVideoStreamType(this.selfUid, 1)

    await this.client.publish([this.selfAudioTrack, this.selfVideoTrack])
    return this.selfUid
  }

  async unpublishLocalSource(mediaType: RtcMediaType) {
    if (mediaType === 'video' && this.selfVideoTrack) {
      await this.client.unpublish(this.selfVideoTrack)
      this.selfVideoTrack.stop()
    } else if (mediaType === 'audio' && this.selfAudioTrack) {
      await this.client.unpublish(this.selfAudioTrack)
      this.selfAudioTrack.stop()
    }
  }

  async publishLocalSource(mediaType: RtcMediaType) {
    if (mediaType === 'video' && this.selfVideoTrack) {
      await this.client.publish(this.selfVideoTrack)
    } else if (mediaType === 'audio' && this.selfAudioTrack) {
      await this.client.publish(this.selfAudioTrack)
      this.selfAudioTrack.play()
    }
  }

  async leave() {
    if (this.selfAudioTrack) {
      this.selfAudioTrack.close()
    }
    if (this.selfVideoTrack) {
      this.selfVideoTrack.close()
    }
    if (this.client) {
      await this.client.leave()
    }

    this.selfUid = this.selfAudioTrack = this.selfVideoTrack = null
    this.attendeeMap = {}
  }

  isMeetingStarted() {
    return this.selfUid && this.selfVideoTrack && this.selfAudioTrack
  }

  getSelfVideoTrack(): RtcCameraVideoTrack | null {
    return this.selfVideoTrack
  }

  getSelfAudioTrack(): RtcMicrophoneAudioTrack | null {
    return this.selfAudioTrack
  }

  getVideoTrack(uid: string): RtcCameraVideoTrack | RtcRemoteVideoTrack | null {
    if (this.selfUid && uid === this.selfUid.toString()) {
      return this.getSelfVideoTrack()
    }

    const attendeeInfo = this.attendeeMap[uid]
    if (attendeeInfo && attendeeInfo.user.videoTrack) {
      return attendeeInfo.user.videoTrack
    }
    return null
  }

  private handleUserPublish = async (user: RtcUser, mediaType: RtcMediaType) => {
    const uid = user.uid.toString()

    await this.client.subscribe(user, mediaType)
    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.play()
    }

    this.dispatch(meetingSlice.actions.subscribeRemoteSource({uid, mediaType}))

    const attendee = this.attendeeMap[uid]
    if (attendee) {
      if (mediaType === 'audio') {
        attendee.hasSubscribedAudio = true
      } else {
        attendee.hasSubscribedVideo = true
      }
    } else {
      this.attendeeMap[uid] = {
        user,
        hasSubscribedAudio: mediaType === 'audio',
        hasSubscribedVideo: mediaType === 'video',
      }
    }
  }

  private handleUserUnpublish = async (user: RtcUser, mediaType: RtcMediaType) => {
    const uid = user.uid.toString()

    await this.client.unsubscribe(user, mediaType)
    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.stop()
    }

    this.dispatch(meetingSlice.actions.unsubscribeRemoteSource({uid, mediaType}))

    const attendee = this.attendeeMap[uid]
    if (attendee) {
      if (mediaType === 'audio') {
        attendee.hasSubscribedAudio = false
      } else {
        attendee.hasSubscribedVideo = false
      }
    }
  }

  private handleUserLeft = (user: RtcUser) => {
    const uid = user.uid.toString()
    const attendee = this.attendeeMap[uid]
    if (attendee) {
      if (attendee.user.audioTrack) {
        attendee.user.audioTrack.stop()
      }
      if (attendee.user.videoTrack) {
        attendee.user.videoTrack.stop()
      }
      delete this.attendeeMap[uid]
    }
    this.dispatch(meetingSlice.actions.removeAttendee(uid))
  }
}

let rtcClientInstance: RTCClient | null = null
export const getRTCClient = (dispatch?: Dispatch): RTCClient => {
  if (!rtcClientInstance) {
    if (!dispatch) {
      throw new Error('dispatch cannot be null')
    }
    rtcClientInstance = new RTCClient(dispatch)
  }
  return rtcClientInstance
}
