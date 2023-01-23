let memberMarkers = {};
let map;
let memberContainer;
const pos = [43.92452406053277, -92.46965157325293];
let profilePicture =
    'https://life360-img.s3.amazonaws.com/img/user_images/82a7dd40-c974-4016-bd26-72b71fc40832/735f5627-8396-4ab6-adb5-dd99fa7c2179.jpg?fd=2';

window.addEventListener('load', async () => {
    memberContainer = document.getElementById('members');
    map = L.map('map').setView(pos, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    let circles = await life360.getCircles();
    let cricleId = circles[0].id;
    let members = await life360.getCircleMembers(cricleId);
    createMembers(members);
    /*updateMembers(members);*/
});

function createMembers(members) {
    createMemberMarkers(members);
    createMemberElements(members);
}

function formatTime(time) {
    time = time * 1000; //convert to ms
    const date = new Date(time);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = 'am';
    let day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    let dateNum = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (hours > 12) {
        hours -= 12;
        ampm = 'pm';
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    let timeString = 'Since ' + hours + ':' + minutes + ' ' + ampm + ' ';
    let currentDate = new Date();
    //                  ms     s    m    h    d
    let sevenDaysInMs = 1000 * 60 * 60 * 24 * 7;
    if (currentDate.getTime() - time < sevenDaysInMs) {
        timeString += day;
    } else {
        timeString += month + '/' + dateNum + '/' + year;
    }
    return timeString;
}

function createMemberElements(users) {
    for (let user of users) {
        let {
            avatar,
            id,
            location: { battery, name, address1, since },
            firstName,
        } = user;
        const member = document.createElement('div');
        member.classList.add('member');
        member.addEventListener('click', () => {
            map.flyTo(memberMarkers[id][0].getLatLng(), 19, { duration: 0.5 });
        });

        const profilePicture = document.createElement('div');
        profilePicture.classList.add('memberProfilePicture');

        const imageContainer = document.createElement('div');
        const image = document.createElement('img');
        image.src = avatar;
        const percentage = document.createElement('p');
        percentage.textContent = battery + '%';

        imageContainer.appendChild(image);
        imageContainer.appendChild(percentage);
        profilePicture.appendChild(imageContainer);

        const memberInfo = document.createElement('div');
        memberInfo.classList.add('memberInfo');

        const memberName = document.createElement('b');
        memberName.textContent = firstName;
        const memberStatus = document.createElement('p');
        memberStatus.textContent = name ? 'At ' + name : address1;
        const memberTime = document.createElement('p');

        memberTime.textContent = formatTime(since);

        memberInfo.appendChild(memberName);
        memberInfo.appendChild(memberStatus);
        memberInfo.appendChild(memberTime);

        member.appendChild(profilePicture);
        member.appendChild(memberInfo);

        memberContainer.appendChild(member);
    }
}

function createMemberMarkers(users) {
    for (let user of users) {
        let {
            id,
            avatar,
            location: { latitude, longitude },
            firstName,
        } = user;
        let markers = memberMarkers[id];
        if (markers) {
            for (let marker of markers) {
                marker.remove();
            }
        }
        memberMarkers[id] = [];
        const pos = [latitude, longitude];
        const profilePictureIcon = L.icon({
            iconUrl: avatar,
            iconSize: [50, 50], // size of the icon
        });
        let profilePicture = L.marker(pos, {
            icon: profilePictureIcon,
            riseOnHover: true,
            title: firstName,
        });
        profilePicture.addTo(map);
        memberMarkers[id].push(profilePicture);
        const circle = L.circle(pos, {
            color: '#8652ff',
            fillColor: '#8652ff',
            fillOpacity: 0.5,
            radius: 50,
        });
        circle.addTo(map);
        memberMarkers[id].push(circle);
    }
}

function updateLocations(locations) {
    for (let location of locations) {
        let { userId, latitude, longitude } = location;
        for (let marker of memberMarkers[userId]) {
            marker.setLatLng([latitude, longitude]);
        }
    }
}