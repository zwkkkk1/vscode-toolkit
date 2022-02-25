// import { request } from '@terminus/mall-utils'
import axios from "axios";

class GoogleTranslation {
  static apiHost = 'https://translate.googleapis.com';

  static async translate(word: string, from: string, to: string) {
    const result = await axios.get(`${this.apiHost}/translate_a/single`, {
      params: {
        client: 'gtx', dt: 't', dj: 1, ie: 'UTF-8', oe: 'UTF-8',
        q: word, sl: from, tl: to,
      }
    });

    return result.data.sentences?.[0].trans || '';
  }
}

export default GoogleTranslation;