"""
Nigerian Government Mental Health Hospitals utility.
Provides proximity-based hospital matching for crisis referrals.

Only the computed nearest hospitals (5 names) are injected into the LLM prompt,
NOT this entire data structure — keeping token usage minimal.
"""

# All Nigerian Government Mental Health Hospitals
# Federal Neuropsychiatric Hospital, Yaba is pinned first per client requirement.
NIGERIAN_HOSPITALS = [

    # === FEDERAL & TEACHING HOSPITALS ===
    {"name": "Federal Neuropsychiatric Hospital, Yaba", "state": "Lagos", "type": "Federal", "address": "8 Harvey Road, Yaba, Lagos"},
    {"name": "Lagos State University Teaching Hospital, Ikeja", "state": "Lagos", "type": "Teaching"},
    {"name": "Lagos University Teaching Hospital, Idi-Araba", "state": "Lagos", "type": "Teaching"},
    {"name": "State Psychiatric Hospital, Abia", "state": "Abia", "type": "State"},
    {"name": "University of Uyo Teaching Hospital", "state": "Akwa Ibom", "type": "Teaching"},
    {"name": "Psychiatric Hospital, Eket", "state": "Akwa Ibom", "type": "State"},
    {"name": "Anambra State Psychiatric Hospital", "state": "Anambra", "type": "State", "address": "Nawfia, Anambra"},
    {"name": "Nnamdi Azikiwe University Teaching Hospital", "state": "Anambra", "type": "Teaching", "address": "Nnewi Onitsha Old Road, Nnewi"},
    {"name": "Chukwuemeka Odumegwu Ojukwu University Teaching Hospital", "state": "Anambra", "type": "Teaching", "address": "Amaku, Awka"},
    {"name": "Abubakar Tafawa Balewa University Teaching Hospital", "state": "Bauchi", "type": "Federal", "address": "Hospital Road, Yandoka Rd, Bauchi"},
    {"name": "Federal Medical Centre, Makurdi", "state": "Benue", "type": "Federal", "address": "Hospital Road, Makurdi"},
    {"name": "Federal Neuro-Psychiatric Hospital, Maiduguri", "state": "Borno", "type": "Federal"},
    {"name": "Federal Neuro-Psychiatric Hospital, Calabar", "state": "Cross River", "type": "Federal"},
    {"name": "University of Calabar Teaching Hospital", "state": "Cross River", "type": "Teaching"},
    {"name": "Alex Ekwueme Federal University Teaching Hospital", "state": "Ebonyi", "type": "Federal", "address": "Ntezi Abba, Abakaliki"},
    {"name": "David Umahi Federal University Teaching Hospital", "state": "Ebonyi", "type": "Federal", "address": "Uburu, Ohaozara"},
    {"name": "Federal Neuro-Psychiatric Hospital, Uselu-Benin", "state": "Edo", "type": "Federal", "address": "Uselu-Lagos Road, Benin City"},
    {"name": "University of Benin Teaching Hospital (UBTH)", "state": "Edo", "type": "Teaching"},
    {"name": "Federal Neuropsychiatric Hospital, New Haven", "state": "Enugu", "type": "Federal", "address": "New Haven, Enugu"},
    {"name": "University of Nigeria Teaching Hospital (UNTH)", "state": "Enugu", "type": "Teaching", "address": "Ituku-Ozalla, Enugu"},
    {"name": "Godfrey Okoye University Teaching Hospital", "state": "Enugu", "type": "Teaching", "address": "Jideofor St, Enugu"},
    {"name": "82 Division NA Medical Services and Hospital", "state": "Enugu", "type": "Federal", "address": "Abakpa, Enugu"},
    {"name": "ESUT Teaching Hospital Parklane", "state": "Enugu", "type": "State", "address": "Enugu"},
    {"name": "National Hospital", "state": "FCT", "type": "Teaching", "address": "Central Business District, Abuja"},
    {"name": "Karu General Hospital", "state": "FCT", "type": "Federal", "address": "Old Karu, New Karu 900101"},
    {"name": "Imo State University Teaching Hospital", "state": "Imo", "type": "Teaching", "address": "Nkwerre, Orlu"},
    {"name": "Federal Teaching Hospital, Owerri", "state": "Imo", "type": "Federal", "address": "105 Hospital Road, Orlu Rd, Owerri"},
    {"name": "Federal Neuro-Psychiatric Hospital, Kaduna", "state": "Kaduna", "type": "Federal", "address": "Barnawa, Kaduna South LGA"},
    {"name": "Kano State Psychiatric Hospital", "state": "Kano", "type": "State"},
    {"name": "Aminu Kano Teaching Hospital", "state": "Kano", "type": "Teaching", "address": "No 2 Zaria Road, Kano"},
    {"name": "Federal Neuro-Psychiatric Hospital, Budo-Egba", "state": "Kwara", "type": "Federal"},
    {"name": "University of Ilorin Teaching Hospital", "state": "Kwara", "type": "Teaching"},
    {"name": "Federal Medical Centre, Bida", "state": "Niger", "type": "Federal", "address": "4 Efu Etsu Yisa Street, Bida"},
    {"name": "Federal Neuro-Psychiatric Hospital, Aro, Abeokuta", "state": "Ogun", "type": "Federal", "address": "Aro, Abeokuta, Ogun"},
    {"name": "Obafemi Awolowo University Teaching Hospital Complex (OAUTHC), Ile-Ife", "state": "Osun", "type": "Teaching"},
    {"name": "University College Hospital (UCH), Ibadan", "state": "Oyo", "type": "Teaching"},
    {"name": "Jos University Teaching Hospital (Drug unit at Vom Christian Hospital)", "state": "Plateau", "type": "Teaching", "address": "Lamingo, Jos"},
    {"name": "University of Port Harcourt Teaching Hospital", "state": "Rivers", "type": "Teaching", "address": "East-West Road, Alakahia, Port Harcourt"},
    {"name": "Federal Neuro-Psychiatric Hospital, Kware", "state": "Sokoto", "type": "Federal", "address": "Maiduguri Rd, Bankanu, Sokoto"},
    {"name": "State Psychiatric Hospital, Sokoto", "state": "Sokoto", "type": "State"},

    # Nigeria Counselling and Rehabilitation Centres (NCRC) — State Offices
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Abia", "type": "Rehabilitation", "address": "Old Party Secretariat, Ogbor Hill, Aba"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Adamawa", "type": "Rehabilitation", "address": "Old SDP Secretariat, No. 1 Abdullahi Bashir Street, Yola Road, Jimeta"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Akwa Ibom", "type": "Rehabilitation", "address": "291 Nwana-Iba Road, Uyo"},
    {"name": "Martha Udom Rehabilitation Centre", "state": "Akwa Ibom", "type": "Rehabilitation", "address": "Uyo, Akwa Ibom"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Anambra", "type": "Rehabilitation", "address": "Old Party Secretariat, Nsugbe Road, Onitsha"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Anambra", "type": "Rehabilitation", "address": "Road 1, House 1, Udoka Housing Estate, Awka"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Bauchi", "type": "Rehabilitation", "address": "White House, Mechanic Village, Jos Road, Bauchi"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Bayelsa", "type": "Rehabilitation", "address": "Okutukuta, Nbiama-Yenagoa Road, Bayelsa"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Bayelsa", "type": "Rehabilitation", "address": "Block 12, Road 2, Okaka Housing Estate, Yenagoa"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Benue", "type": "Rehabilitation", "address": "Old SDP Secretariat, Ankpa Road, Makurdi"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Borno", "type": "Rehabilitation", "address": "Old Party Secretariat, Gamboru Ngala Road, Maiduguri"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Cross River", "type": "Rehabilitation", "address": "3 Harbour Road, Calabar"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Delta", "type": "Rehabilitation", "address": "Old SDP Secretariat, Isah Road, Ogwashi-Uku"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Ebonyi", "type": "Rehabilitation", "address": "10 Elias Odili Street, Abakaliki"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Edo", "type": "Rehabilitation", "address": "Old SDP Secretariat, Upper Sokponba, Benin City"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Enugu", "type": "Rehabilitation", "address": "Old SDP Secretariat, Vosan Drive, Independence Layout, Enugu"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "FCT", "type": "Rehabilitation", "address": "Plot 1093, Joseph Gomwalk Street, Gudu, Abuja"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Gombe", "type": "Rehabilitation", "address": "Old BASAC Office, BCJ, Gombe"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Imo", "type": "Rehabilitation", "address": "Old NRC Party Office, Aba Road, Owerri"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Jigawa", "type": "Rehabilitation", "address": "NIFOR Quarters, Dutse"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Kaduna", "type": "Rehabilitation", "address": "Olusegun Obasanjo Secretariat, Yakubu Gowon Road, Kaduna"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Kano", "type": "Rehabilitation", "address": "Kano State Command, Airport Road, Kano"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Katsina", "type": "Rehabilitation", "address": "Party Secretariat, Kofar Kwaya, Katsina"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Kebbi", "type": "Rehabilitation", "address": "No. 25 Emir Haruna Road, Birnin Kebbi"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Kogi", "type": "Rehabilitation", "address": "New Layout, Liberty Hotel Area, Lokoja"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Kogi", "type": "Rehabilitation", "address": "No. 3, Tunde Ogbeha Street, GRA, Lokoja"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Kwara", "type": "Rehabilitation", "address": "Defunct NRC Party Office, KM 2 Sobi Barracks Road, Ilorin"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Lagos", "type": "Rehabilitation", "address": "5 Jogunomi Street, Gbagada Phase 2 Estate, Lagos"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Nasarawa", "type": "Rehabilitation", "address": "State Command, Makurdi Road, Lafia"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Niger", "type": "Rehabilitation", "address": "Defunct NRC Secretariat, Western Bye-Pass, Opposite Police Secondary School, Minna"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Ogun", "type": "Rehabilitation", "address": "Quarter 07, Oba Ademola Road, GRA, Abeokuta"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Ondo", "type": "Rehabilitation", "address": "257 Alagbaka, GRA, Akure"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Osun", "type": "Rehabilitation", "address": "Old Ikirun Road, Osogbo"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Oyo", "type": "Rehabilitation", "address": "QTR 585, Link Reservation, Onikere GRA, Ibadan"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Plateau", "type": "Rehabilitation", "address": "Former Signal Barracks, Katon-Rikkos, Jos"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Rivers", "type": "Rehabilitation", "address": "Defunct SDP Secretariat, Artillery Junction, Aba Road, Port Harcourt"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Sokoto", "type": "Rehabilitation", "address": "Former Party House, Kalam Baina Road, Arkilla Nasarawa"},
    {"name": "Nigeria Counselling & Rehabilitation Centre", "state": "Yobe", "type": "Rehabilitation", "address": "Plot No. 19, State Low-Cost Extension, Damaturu"},
]

# Neighbouring states for proximity matching
STATE_NEIGHBOURS = {
    "Abia": ["Imo", "Anambra", "Enugu", "Cross River", "Akwa Ibom", "Rivers"],
    "Adamawa": ["Borno", "Gombe", "Taraba", "Plateau"],
    "Akwa Ibom": ["Cross River", "Rivers", "Abia"],
    "Anambra": ["Enugu", "Delta", "Imo", "Abia", "Kogi"],
    "Bauchi": ["Gombe", "Plateau", "Kaduna", "Kano", "Jigawa", "Yobe"],
    "Bayelsa": ["Rivers", "Delta"],
    "Benue": ["Nasarawa", "Taraba", "Cross River", "Enugu", "Kogi"],
    "Borno": ["Yobe", "Adamawa", "Gombe"],
    "Cross River": ["Akwa Ibom", "Ebonyi", "Benue", "Enugu", "Abia"],
    "Delta": ["Edo", "Anambra", "Imo", "Bayelsa", "Rivers", "Ondo"],
    "Ebonyi": ["Enugu", "Cross River", "Abia", "Benue"],
    "Edo": ["Delta", "Kogi", "Ondo", "Anambra"],
    "Ekiti": ["Ondo", "Osun", "Kwara", "Kogi"],
    "Enugu": ["Anambra", "Abia", "Ebonyi", "Benue", "Kogi"],
    "FCT": ["Nasarawa", "Niger", "Kogi", "Kaduna"],
    "Gombe": ["Bauchi", "Borno", "Yobe", "Adamawa", "Taraba"],
    "Imo": ["Abia", "Anambra", "Delta", "Rivers"],
    "Jigawa": ["Kano", "Bauchi", "Yobe", "Katsina"],
    "Kaduna": ["Katsina", "Kano", "Bauchi", "Plateau", "Nasarawa", "Niger", "FCT"],
    "Kano": ["Katsina", "Jigawa", "Bauchi", "Kaduna"],
    "Katsina": ["Kano", "Jigawa", "Kaduna", "Zamfara"],
    "Kebbi": ["Sokoto", "Zamfara", "Niger"],
    "Kogi": ["Benue", "Nasarawa", "FCT", "Niger", "Kwara", "Ekiti", "Ondo", "Edo", "Anambra", "Enugu"],
    "Kwara": ["Niger", "Kogi", "Ekiti", "Osun", "Oyo"],
    "Lagos": ["Ogun"],
    "Nasarawa": ["Kaduna", "Plateau", "Taraba", "Benue", "Kogi", "FCT"],
    "Niger": ["Kebbi", "Zamfara", "Kaduna", "FCT", "Kogi", "Kwara"],
    "Ogun": ["Lagos", "Oyo", "Ondo"],
    "Ondo": ["Ogun", "Osun", "Ekiti", "Kogi", "Edo", "Delta"],
    "Osun": ["Oyo", "Ogun", "Ondo", "Ekiti", "Kwara"],
    "Oyo": ["Ogun", "Osun", "Kwara"],
    "Plateau": ["Kaduna", "Bauchi", "Nasarawa", "Taraba", "Benue"],
    "Rivers": ["Bayelsa", "Delta", "Abia", "Akwa Ibom", "Imo"],
    "Sokoto": ["Kebbi", "Zamfara"],
    "Taraba": ["Adamawa", "Gombe", "Plateau", "Nasarawa", "Benue"],
    "Yobe": ["Borno", "Gombe", "Bauchi", "Jigawa"],
    "Zamfara": ["Sokoto", "Kebbi", "Niger", "Kaduna", "Katsina"],
}


def get_nearest_hospitals(user_state: str, max_results: int = 5) -> list:
    """
    Get the nearest government mental health hospitals based on user's state.
    Federal Neuropsychiatric Hospital, Yaba is always returned first.
    Remaining slots are filled by proximity (own state -> neighbours -> federal fallback).
    """
    fnph_yaba = NIGERIAN_HOSPITALS[0]  # Always index 0

    if not user_state:
        return NIGERIAN_HOSPITALS[:max_results]

    user_state_normalized = user_state.strip().title()
    nearest = []

    # First: hospitals in the user's own state (excluding Yaba — added separately)
    for h in NIGERIAN_HOSPITALS:
        if h is fnph_yaba:
            continue
        if h["state"].lower() == user_state_normalized.lower():
            nearest.append(h)

    # Second: hospitals in neighbouring states
    if len(nearest) < max_results - 1:
        neighbours = STATE_NEIGHBOURS.get(user_state_normalized, [])
        for neighbour in neighbours:
            for h in NIGERIAN_HOSPITALS:
                if h is fnph_yaba:
                    continue
                if h["state"].lower() == neighbour.lower() and h not in nearest:
                    nearest.append(h)
                    if len(nearest) >= max_results - 1:
                        break
            if len(nearest) >= max_results - 1:
                break

    # Fallback: if still not enough, add major federal hospitals
    if len(nearest) < max_results - 1:
        for h in NIGERIAN_HOSPITALS:
            if h is fnph_yaba:
                continue
            if h not in nearest and h["type"] == "Federal":
                nearest.append(h)
                if len(nearest) >= max_results - 1:
                    break

    # Pin Yaba first, then proximity results
    return [fnph_yaba] + nearest[:max_results - 1]


def format_nearest_hospitals(user_state: str) -> str:
    """
    Format nearest hospitals as a short text block for prompt injection.
    Only ~50 tokens added to the prompt.
    """
    hospitals = get_nearest_hospitals(user_state)
    if not hospitals:
        return ""

    text = "\nNEAREST MENTAL HEALTH & REHABILITATION FACILITIES:\n"
    for i, h in enumerate(hospitals, 1):
        address = f" -- {h['address']}" if h.get("address") else ""
        text += f"  {i}. {h['name']} ({h['state']} State){address}\n"

    return text