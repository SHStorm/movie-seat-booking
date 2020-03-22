const LocalStorage = {
    save(key, value) {
        this.saveRaw(key, JSON.stringify(value));
    },

    saveRaw(key, rawValue) {
        localStorage.setItem(key, rawValue);
    },

    load(key) {
        return JSON.parse(this.loadRaw(key));
    },

    loadRaw(key) {
        return localStorage.getItem(key);
    },

    has(key) {
        return this.loadRaw(key) !== null;
    }
};

const $moviePicker = document.getElementById('movie-picker');
const $cinema = document.getElementById('cinema');
const $totalSeats = document.getElementById('total-seats');
const $totalCost = document.getElementById('total-cost');
const $bookButton = document.getElementById('book');

$moviePicker.addEventListener('change', loadSeatStates);
$bookButton.addEventListener('click', bookSelectedSeats);
$cinema.addEventListener('click', ({ target }) => {
    if (!isSeat(target)) {
        return;
    }

    toggleSeatSelection(target);
});

loadSeatStates();

function bookSelectedSeats() {
    getSelectedSeats().forEach(occupySeat);
}

function occupySeat($seat) {
    $seat.classList.remove('is-selected');
    $seat.classList.add('is-occupied');
    saveSeatStates();
    updateCostSummary();
}

function toggleSeatSelection($seat) {
    $seat.classList.toggle('is-selected');
    saveSeatStates();
    updateCostSummary();
}

function updateCostSummary() {
    const selectedSeatsCount = getSelectedSeats().length;

    $totalSeats.textContent = selectedSeatsCount.toString();
    $totalCost.textContent = (getSelectedMovieTicketPrice() * selectedSeatsCount).toString();
}

function getSelectedSeats() {
    return getSeats().filter(isSelected);
}

function getSeats() {
    return Array.from($cinema.getElementsByClassName('seat'));
}

function getSelectedMovieId() {
    return getSelectedMovieOption().value;
}

function getSelectedMovieTicketPrice() {
    return Number(getSelectedMovieOption().dataset.ticketPrice);
}

function getSelectedMovieOption() {
    return $moviePicker.options[$moviePicker.selectedIndex];
}

function isSelected($seat) {
    return $seat.classList.contains('is-selected');
}

function isSeat($element) {
    return $element.classList.contains('seat');
}

function loadSeatStates() {
    if (!LocalStorage.has('seat-bookings')) {
        return;
    }

    const bookings = LocalStorage.load('seat-bookings');

    if (!bookings.hasOwnProperty(getSelectedMovieId())) {
        resetSeatStates();
        saveSeatStates();
    } else {
        setSeatStates(bookings[getSelectedMovieId()]);
    }
}

function saveSeatStates() {
    const bookings = LocalStorage.has('seat-bookings') ? LocalStorage.load('seat-bookings') : {};
    bookings[getSelectedMovieId()] = getSeatStates();
    LocalStorage.save('seat-bookings', bookings);
}

function resetSeatStates() {
    setSeatStates(new Array(48).fill('available'));
}

function setSeatStates(seatStates) {
    const $seats = getSeats();

    seatStates.forEach((seatState, index) => {
        setSeatState($seats[index], seatState);
    });
}

function getSeatStates() {
    return getSeats().map(getSeatState);
}

function setSeatState($seat, state) {
    $seat.className = 'seat';

    if (state === 'occupied') {
        $seat.classList.add('is-occupied');
    } else if (state === 'selected') {
        $seat.classList.add('is-selected');
    }

    updateCostSummary();
}

function getSeatState($seat) {
    if ($seat.classList.contains('is-occupied')) {
        return 'occupied';
    } else if ($seat.classList.contains('is-selected')) {
        return 'selected';
    }

    return 'available';
}
