/**
 * The leadership roster behind the "Team" section on the About page.
 *
 * Portraits live in `public/team/` (see team.txt there for the source list).
 * This is the baseline the section always renders, so the page never shows an
 * empty grid while the CMS is unreachable or unpopulated. Members published
 * through the admin Team tab (/admin/public/team/) are merged on top — see
 * `mergeTeam` below.
 */

const photo = (file) => encodeURI(`/team/${file}`);

export const STATIC_TEAM = [
  { id: 'static-1', name: 'Syed Abdul Wahab', role: 'Founder & CEO', photo: photo('01 - Syed Abdul Wahab.jpeg') },
  { id: 'static-2', name: 'Sabarishan N.', role: 'Managing Director', photo: photo('02 - Sabarishan N.jpg') },
  { id: 'static-3', name: 'Manasa Iyer', role: 'Admin & Finance Director', photo: photo('03 - Manasa Iyer.jpeg') },
  { id: 'static-4', name: 'Karthikeyan Sekar', role: 'Regional Manager, Sales - South', photo: photo('04 - Karthikeyan Sekar.jpeg') },
  { id: 'static-5', name: 'Sneha Shenoy', role: 'HR Operations Manager', photo: photo('05 - Sneha Shenoy.png') },
  { id: 'static-6', name: 'Karthikeyan Selvaraj', role: 'Country Head, Projects & Service Support', photo: photo('06 - Karthikeyan Selvaraj.png') },
  { id: 'static-7', name: 'Flavia Robert', role: 'Finance & Administration Manager', photo: photo('07 - Flavia Robert.png') },
  { id: 'static-8', name: 'Sajid Ali Kazi', role: 'Regional Sales Manager', photo: photo('08 - Sajid Ali Kazi.png') },
];

const nameKey = (name) => (name || '').toLowerCase().replace(/[^a-z]/g, '');

/**
 * Static roster first, then backend members. A backend member whose name
 * matches a static one replaces it in place (keeping the static photo if the
 * CMS entry has none), so adding someone in the admin never duplicates a card.
 */
export const mergeTeam = (staticTeam, apiTeam) => {
  const merged = staticTeam.map((m) => ({ ...m }));
  const indexByName = new Map(merged.map((m, i) => [nameKey(m.name), i]));

  apiTeam.forEach((member) => {
    const i = indexByName.get(nameKey(member.name));
    if (i === undefined) {
      merged.push(member);
    } else {
      merged[i] = { ...member, photo: member.photo || merged[i].photo };
    }
  });

  return merged;
};
