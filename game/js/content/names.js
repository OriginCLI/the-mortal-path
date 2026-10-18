// Korean-style names for generated characters (the setting uses Korean murim conventions in English).

export const FAMILY_NAMES = ['Kim', 'Lee', 'Park', 'Choi', 'Jeong', 'Kang', 'Jo', 'Yun', 'Jang', 'Lim', 'Han', 'Oh', 'Seo', 'Shin',
  'Kwon', 'Hwang', 'Ahn', 'Song', 'Yu', 'Hong', 'Jeon', 'Go', 'Mun', 'Yang', 'Son', 'Bae', 'Baek', 'Heo', 'Nam', 'Ma', 'Ha', 'Gwak', 'Seong', 'Cha', 'Ju', 'Woo', 'Min', 'Do'];

const SYL_M = ['Jin', 'Ho', 'Hyun', 'Woo', 'Seok', 'Cheol', 'Jun', 'Young', 'Min', 'Sung', 'Tae', 'Gyu', 'Hwan', 'Beom', 'Yeol', 'Gang', 'Mun', 'Il', 'Do', 'Ryong', 'Un', 'Chan', 'Hun', 'Jae'];
const SYL_F = ['Hwa', 'Yeon', 'Seol', 'Ah', 'Ryeong', 'Hee', 'Ji', 'Min', 'Seo', 'Yu', 'Na', 'Eun', 'Ha', 'Ran', 'Ok', 'Mi', 'Bin', 'Sol', 'Yeong', 'Hyang', 'Ga', 'Rin', 'Ae', 'Jeong'];

export function givenName(rng, gender) {
  const pool = gender === 'f' ? SYL_F : SYL_M;
  const a = rng.pick(pool);
  let b = rng.pick(pool);
  if (b === a) b = rng.pick(pool);
  return `${a}-${b.toLowerCase()}`;
}

export function fullName(rng, gender, family) {
  return `${family || rng.pick(FAMILY_NAMES)} ${givenName(rng, gender)}`;
}

// Murim nicknames ("the Blood Blade Ghost") for notable generated fighters.
const NICK_A = ['Iron', 'Blood', 'Ghost', 'Thunder', 'Jade', 'Black', 'Crimson', 'Mad', 'Silent', 'Laughing', 'One-Eyed', 'White', 'Hungry', 'Drunken', 'Nine-Fingered'];
const NICK_B = ['Blade', 'Fist', 'Tiger', 'Wolf', 'Crane', 'Saber', 'Demon', 'Monk', 'Scholar', 'Viper', 'Hawk', 'Ghost', 'Butcher', 'Moon', 'Wind'];
export const nickname = (rng) => `the ${rng.pick(NICK_A)} ${rng.pick(NICK_B)}`;
