let memberMarkers = {};
let placeMarkers = {};
let memberData = {};
let map;
let memberContainer;
let circleSelector;
let locationUpdater;

window.addEventListener('load', async () => {
    memberContainer = document.getElementById('members');
    circleSelector = document.getElementById('circleSelector');
    map = L.map('map').setView([0, 0], 1);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    let circles = await life360.getCircles();
    createCircles(circles);
    circleSelector.addEventListener('change', (event) => {
        const selector = event.currentTarget;
        const circleId = selector.value;
        changeCircle(circleId);
    });
    let defaultCircleId = circles[0].id;
    await changeCircle(defaultCircleId);
});

function createCircles(circles) {
    for (let circle of circles) {
        let { name, id } = circle;
        let option = document.createElement('option');
        option.innerText = name;
        option.setAttribute('value', id);
        circleSelector.appendChild(option);
    }
}

async function changeCircle(circleId) {
    let members = await life360.getCircleMembers(circleId);
    let places = await life360.getCirclePlaces(circleId);
    createMembers(members);
    createPlaces(places);
    if (locationUpdater) clearInterval(locationUpdater);
    locationUpdater = setInterval(async () => {
        updateLocations(await life360.getCircleMembersLocation(circleId));
    }, 5000);
    //update map view
    let { latitude, longitude } = members[0].location;
    map.setView([latitude, longitude], 19);
}

function createMembers(members) {
    loadMembers(members);
    createMemberMarkers(members);
    createMemberElements(members);
}

function loadMembers(members) {
    memberData = {}; //reset member data
    for (let member of members) {
        let {
            id,
            firstName,
            location: { name },
        } = member;
        memberData[id] = {};
        memberData[id].lastLocation = name; //save last location
        memberData[id].firstName = firstName;
    }
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
    memberContainer.innerHTML = ''; //remove all existing members
    for (let user of users) {
        let {
            avatar,
            id,
            location: { battery, name, address1, since },
            firstName,
        } = user;
        const member = document.createElement('div');
        member.classList.add('member');
        member.setAttribute('id', id);
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
        memberStatus.classList.add('location');
        const memberTime = document.createElement('p');
        memberTime.classList.add('time');
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
    for (let markerArray of Object.values(memberMarkers)) {
        for (let marker of markerArray) {
            marker.remove(); //remove all already existing member markers
        }
    }
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
        const profilePictureIcon = L.divIcon({
            className: 'profilePicture',
            html: '<img src="' + avatar + '"/>',
            iconUrl: avatar,
            iconSize: [50, 50], // size of the icon
        });
        let profilePicture = L.marker(pos, {
            icon: profilePictureIcon,
            riseOnHover: true,
        });
        profilePicture.bindTooltip(firstName);
        profilePicture.on('click', () => {
            map.flyTo(profilePicture.getLatLng(), 19, { duration: 0.5 });
        });
        profilePicture.addTo(map);
        memberMarkers[id].push(profilePicture);
    }
}

async function updateLocations(locations) {
    for (let location of locations) {
        let { userId, latitude, longitude, name, address1, since } = location;
        //move marker
        for (let marker of memberMarkers[userId]) {
            marker.setLatLng([latitude, longitude]);
        }
        //update member element
        let memberElement = document.getElementById(userId);
        memberElement.querySelector('p.location').textContent = name ? 'At ' + name : address1;
        memberElement.querySelector('p.time').textContent = formatTime(since);
        //create notification if need be
        if (memberData[userId].lastLocation != name) {
            if (!name) {
                await notifications.create(
                    memberData[userId].firstName + ' left ' + memberData[userId].lastLocation
                );
            } else {
                await notifications.create(memberData[userId].firstName + ' arrived at ' + name);
            }

            memberData[userId].lastLocation = name;
        }
    }
}

function createPlaces(places) {
    for (let marker of Object.values(placeMarkers)) {
        marker.remove();
    }
    for (let place of places) {
        let { name, latitude, longitude, radius, id } = place;
        const circle = L.circle([latitude, longitude], {
            color: '#8652ff',
            fillColor: '#8652ff',
            fillOpacity: 0.5,
            radius,
        });
        circle.bindTooltip(name);
        circle.addTo(map);
        placeMarkers[id] = circle;
    }
}
