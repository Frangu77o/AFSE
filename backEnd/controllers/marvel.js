import { config } from 'dotenv';
import { createHash } from 'crypto';

config({ path: '../../.env' });

const publicKey = process.env.MARVEL_PUBLIC_KEY;
const privateKey = process.env.MARVEL_PRIVATE_KEY;

const baseUrl = "https://gateway.marvel.com/v1/public/characters";

var timestamp = new Date().getTime();

var parameters = `ts=${timestamp}&apikey=${publicKey}&hash=${createHash('md5').update(timestamp+privateKey+publicKey).digest('hex')}&`


export async function getSuperHero(id) {
    try {
        const ts = new Date().getTime();
        const hash = createHash('md5').update(ts+privateKey+publicKey).digest('hex')
        const response = await fetch(`${baseUrl}?ts=${ts}&hash=${hash}limit=1&offset=${id}`);
        const data = await response.json();
        if(data.data.results.length > 0) {
            var img = data.data.results[0].thumbnail.path + "." + data.data.results[0].thumbnail.extension
            var id = data.data.results[0].id;
            var name = data.data.results[0].name;
            if(!img || !id || !name || img.includes("image_not_available")) {
                return null;
            }
            return { img, id, name };
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function getAllSuperHero() {
    try {
        const ts = new Date().getTime();
        const hash = createHash('md5').update(ts+privateKey+publicKey).digest('hex');
        const response = await fetch(`${baseUrl}?ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=10`);
        if(response.ok) {
            var data = await response.json();
            var results = data?.data?.results;
            if(results) return results;
            return null;
        }
        console.log(response.statusText, await response.text());
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}