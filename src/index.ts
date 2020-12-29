import { PatternPasteEvent } from '@editorjs/editorjs/types/tools/paste-events'
import { API } from '@editorjs/editorjs/types/index'
import { ToolConfig } from '@editorjs/editorjs/types/tools/tool-config'
import '@rmwc/circular-progress/circular-progress.css'

export type TweetData = {
  username: string
  id: string
  url: string
}

interface Constructor {
  data?: TweetData
  api: API
  config?: ToolConfig
}

declare global {
  interface Window { twttr: any }
}

export default class Twitter {
  private tweetData: TweetData
  private wrapper: HTMLElement
  private loader: HTMLElement
  private tweetContainer: HTMLElement

  constructor(params: Constructor) {
    this.tweetData = params.data!
    this.wrapper = document.createElement('div')
    this.tweetContainer = document.createElement('div')
    this.loader = this.createCircularProgress()
    this.wrapper.appendChild(this.loader)
    this.wrapper.appendChild(this.tweetContainer)
    this.tweetContainer.style.height = '0px'
    if (this.tweetData && this.tweetData.url) {
      this.tweetData.url = this.tweetData.url.trim()
    }
  }

  public onPaste(event: PatternPasteEvent) {
    this.handlePastedUrl(event.detail.data)
  }

  private handlePastedUrl(url: string) {
    url = url.trim()
    const tweetID = url.match(/twitter\.com\/.*\/status(?:es)?\/([^/?]+)/)
    const tweetUsername = url.match(/((https?:\/\/)?(www\.)?twitter\.com\/)?(@|#!\/)?([A-Za-z0-9_]{1,15})/)
    if (tweetID && tweetID[1] && tweetUsername && tweetUsername[5]) {
      this.tweetData = {
        username: tweetUsername[5],
        id: tweetID[1].toString(),
        url
      }
      this.createTweet()
    }
  }

  private createTweet() {
    window.twttr.widgets.createTweet(this.tweetData.id, this.tweetContainer).then((el: any) => {
      if (el) {
        el.parentNode.style.height = 'auto'
        el.parentNode.previousElementSibling.remove()
      }
    })
  }

  static get pasteConfig() {
    return {
      patterns: {
        twitter: /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?([^?]+)(\?.*)?$/
      }
    }
  }

  private createCircularProgress(): HTMLElement {
    const container = document.createElement('div')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')

    container.classList.add('rmwc-circular-progress', 'rmwc-circular-progress--indeterminate', 'rmwc-circular-progress--thickerstroke')
    svg.classList.add('rmwc-circular-progress__circle')
    circle.classList.add('rmwc-circular-progress__path')

    svg.setAttribute('viewBox', '0 0 72 72')
    circle.setAttribute('cx', '36')
    circle.setAttribute('cy', '36')
    circle.setAttribute('r', '30')

    svg.appendChild(circle)
    container.appendChild(svg)

    container.style.fontSize = '72px'

    return container
  }

  public save(): TweetData {
    return this.tweetData
  }

  public render(): HTMLElement {
    if (this.tweetData.id) {
      this.createTweet()
    }
    return this.wrapper
  }
}
