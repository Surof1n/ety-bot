export class MemberAuthProcessSearchParams {
  channelId?: string

  constructor(channelId?: string) {
    this.channelId = channelId
  }

  static byChannelId(channelId: string): MemberAuthProcessSearchParams {
    const result = new MemberAuthProcessSearchParams(channelId)

    return result
  }
}
