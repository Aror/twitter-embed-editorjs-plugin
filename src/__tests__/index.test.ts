import Twitter from '../index'
import { def } from 'bdd-lazy-var/global'
import { TweetData } from '../index'

declare const $params: { data: TweetData, api: any }
declare const $subject: any
declare const $pasteEvent: { detail : { data: string }}
declare const $regex: { patterns: { twitter: RegExp }}

def('params', () => ({
  data: {
    username: 'Worrun',
    id: '1184211098960044033',
    url: 'https://twitter.com/Worrun/status/1184211098960044033?s=20                 ',
  },
  api: {}
}))
def('subject', () => new Twitter($params))
def('pasteEvent', () => ({ detail: { data: $params.data.url }}))
def('regex', () => ({ patterns: { twitter: /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?([^?]+)(\?.*)?$/ }}))

describe('Twitter Class', () => {
  it('returns a HTMLDivElement', () => {
    expect($subject.render().toString()).toEqual('[object HTMLDivElement]')
  })

  it('strips whitespaces from the url param', () => {
    expect($subject.tweetData.url).toEqual('https://twitter.com/Worrun/status/1184211098960044033?s=20')
  })

  describe('onPaste', () => {
    const parent = document.createElement('div')
    const child = document.createElement('div')
    const newTweetElement = jest.fn().mockImplementation(() => Promise.resolve(child))

    parent.append(child)
    Object.defineProperty(parent, 'previousElementSibling', { value: { remove: jest.fn() }})
    Object.defineProperty(window, 'twttr', { value: { widgets: { createTweet: newTweetElement }}})

    it('creates a tweet', () => {
      $subject.onPaste($pasteEvent)
      expect(newTweetElement).toHaveBeenCalled()
    })
  })

  describe('save', () => {
    it('returns tweet data', () => {
      expect($subject.save()).toMatchObject($params.data)
    })
  })

  describe('pasteConfig', () => {
    it('returns twitter url pattern', () => {
      expect(Twitter.pasteConfig).toMatchObject($regex)
    })
  })
})
