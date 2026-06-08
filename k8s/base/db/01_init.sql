-- Sources for the data: DaysGone, IGN, Fandom, GameFAQs (guides by SENIORBILL & ExtremePhobia), gamepressure (mechanics list)

-- dropping all tables -- no need for cascade since they are dropped in right order
drop table if exists mission_order;
drop table if exists mission;
drop table if exists infestation;
drop table if exists horde;
drop table if exists reward;
drop table if exists collectible;
drop table if exists merchant;
drop table if exists mechanic;
drop table if exists camp;
drop table if exists region;

create table region (
id_region int primary key check (id_region between 1 and 6),
region_name varchar(16) not null
);

-- Camp tables
create table camp (
id_camp int primary key check (id_camp between 1 and 5),
region int not null references region(id_region) check (region between 1 and 6),
camp_name varchar(32),
description text
-- leader
);

create table merchant (
id_merchant serial primary key,
camp int not null references camp(id_camp)  check (camp between 1 and 5),
item varchar(32) not null,
price smallint not null check (price > 0),
trust smallint not null check (trust between 0 and 3),
condition smallint check (condition between 1 and 5),
consumable boolean not null
);

create table mechanic (
id_mechanic serial primary key,
camp int not null references camp(id_camp)  check (camp between 1 and 5),
upgrade varchar(32) not null,
price smallint not null check (price > 0),
trust smallint not null check (trust between 0 and 3),
description text
);

-- world activities
create table collectible (
id_collectible serial primary key,
region int not null references region(id_region) check (region between 1 and 6),
collectible_name varchar(64) not null,
description text
);

create table reward (
id_reward varchar(12) primary key,
xp smallint check (xp > 0),
trust smallint check (trust > 0),
credits smallint check (credits > 0)
);

create table horde (
id_horde serial primary key,
region int not null references region(id_region) check (region between 1 and 6),
reward varchar(12) not null references reward(id_reward),
camp int not null references camp(id_camp) check (camp between 1 and 5),
horde_name varchar(32) not null,
size smallint not null check (size > 0)
);

create table infestation (
id_infestation serial primary key,
region int not null references region(id_region) check (region between 1 and 6),
reward varchar(12) references reward(id_reward),
camp int not null references camp(id_camp) check (camp between 1 and 5),
infestation_name varchar(64) not null,
nr_nests smallint not null check (nr_nests > 0)
);

-- missions
create table mission (
id_mission int primary key,
region int not null references region(id_region) check (region between 1 and 6),
reward varchar(12) references reward(id_reward),
camp int references camp(id_camp) check (camp between 1 and 5),
mission_name varchar(64) not null,
description text,
main boolean not null,
start_time time
-- storyline(s) 
);

create table mission_order (
id serial primary key,
previous_mission int not null references mission(id_mission),
next_mission int not null references mission(id_mission)
);

-- regions
insert into region(id_region, region_name) values
(1, 'Cascade'),
(2, 'Belknap'),
(3, 'Lost Lake'),
(4, 'Iron Butte'),
(5, 'Crater Lake'),
(6, 'Highway 97');

-- camps
insert into camp(id_camp, region, camp_name, description) values
(1, 1, 'Copeland''s Camp', 'Situated on Peaceful Lake in the Cascade wilderness, Mark Copeland''s Encampment is founded on a strong belief in individual freedom.'),
(2, 2, 'Hot Springs', 'What was once a beautiful resort and spa, the Hot Springs Encampment is a forced labour camp run by Ada Tucker.'),
(3, 3, 'Iron Mike''s Camp', 'The Lost Lake Encampment is run by "Iron" Mike Wilcox who is desperately struggling to restore democracy.'),
(4, 5, 'Diamond Lake', 'The Diamond Lake Encampment is a Deschutes County Militia outpost run by Captain Derrick Kouri.'),
(5, 5, 'Wizard Island', 'Run by Colonel Matthew Garret, the Wizard Island Encampment is the fortified stronghold of the Deschutes County Militia.');

-- Merchants
insert into merchant(camp, item, price, trust, condition, consumable) values
(1, 'Rifle Ammo', 140, 0, null, true),
(1, 'Special Ammo', 200, 0, null, true),
(1, 'Pistol Ammo', 75, 0, null, true),
(1, 'Saddlebag Ammo', 400, 0, null, true),
(1, 'Sidearm Suppressor', 30, 1, null, true),
(1, 'Primary Suppressor', 45, 2, null, true),
(1, 'Special Suppressor', 60, 2, null, true),
(1, 'Medkit', 100, 2, null, true),
(1, 'Frag Grenade', 100, 3, null, true),
(2, '.22 Repeater', 1000, 0, 2, false),
(2, 'MWS', 2000, 2, 3, false),
(2, 'Stinger', 1000, 2, 2, false),
(2, 'RSF60', 3000, 2, 3, false),
(2, 'Combat Shotgun', 2500, 3, 4, false),
(2, 'US556', 3750, 3, 3, false),
(2, 'SAP9', 500, 0, 2, false),
(2, 'Lil'' Stubby', 2000, 2, 1, false),
(2, 'SMP9', 1250, 3, 1, false),
(2, 'M40', 2250, 1, 2, false),
(2, 'MG 45', 2500, 3, 3, false),
(2, 'Rifle Ammo', 140, 0, null, true),
(2, 'Special Ammo', 200, 0, null, true),
(2, 'Pistol Ammo', 75, 0, null, true),
(2, 'Saddlebag Ammo', 400, 0, null, true),
(2, 'Sidearm Suppressor', 30, 1, null, true),
(2, 'Primary Suppressor', 45, 1, null, true),
(2, 'Special Suppressor', 60, 2, null, true),
(2, 'Medkit', 100, 2, null, true),
(2, 'Frag Grenade', 100, 3, null, true),
(2, 'US556 Mag Upgrade', 400, 3, null, false),
(2, 'SMP9 Mag Upgrade', 100, 3, null, false),
(2, 'MG 45 Mag Upgrade', 600, 3, null, false),
(3, 'M14', 1000, 1, 3, false),
(3, 'SWAT 10', 1500, 2, 4, false),
(3, 'M50 Reising', 2000, 2, 4, false),
(3, 'Crowdbreaker', 2500, 2, 4, false),
(3, 'Liberator', 3000, 2, 4, false),
(3, 'Lil'' Stubby', 2000, 2, 3, false),
(3, 'SMP9', 1250, 3, 3, false),
(3, 'C8 Rifle', 2250, 1, 3, false),
(3, 'Talon 7', 3750, 3, 4, false),
(3, 'Rifle Ammo', 140, 0, null, true),
(3, 'Special Ammo', 200, 0, null, true),
(3, 'Pistol Ammo', 75, 0, null, true),
(3, 'Saddlebag Ammo', 400, 0, null, true),
(3, 'Sidearm Suppressor', 30, 1, null, true),
(3, 'Primary Suppressor', 45, 2, null, true),
(3, 'Special Suppressor', 60, 2, null, true),
(3, 'Medkit', 100, 3, null, true),
(3, 'Flashbang', 100, 2, null, true),
(3, 'Frag Grenade', 100, 3, null, true),
(4, 'Rifle Ammo', 140, 0, null, true),
(4, 'Special Ammo', 200, 0, null, true),
(4, 'Pistol Ammo', 75, 0, null, true),
(4, 'Saddlebag Ammo', 400, 0, null, true),
(4, 'Sidearm Suppressor', 30, 1, null, true),
(4, 'Primary Suppressor', 45, 1, null, true),
(4, 'Special Suppressor', 60, 1, null, true),
(4, 'Medkit', 100, 1, null, true),
(4, 'Flashbang', 100, 3, null, true),
(4, 'Frag Grenade', 100, 2, null, true),
(5, 'PPSH-41', 2250, 1, 4, false),
(5, 'Chicago Chopper', 3000, 2, 4, false),
(5, 'The Cowboy', 1000, 2, 4, false),
(5, 'Nock Volley', 2500, 3, 4, false),
(5, 'Badlands Big Game', 3750, 3, 5, false),
(5, 'Lil'' Stubby', 2250, 1, 4, false),
(5, 'Eliminator', 2000, 2, 4, false),
(5, 'PDW', 1250, 3, 5, false),
(5, 'RPD', 1500, 1, 4, false),
(5, '.50 BFG', 3000, 2, 5, false),
(5, 'Rifle Ammo', 140, 0, null, true),
(5, 'Special Ammo', 200, 0, null, true),
(5, 'Pistol Ammo', 75, 0, null, true),
(5, 'Saddlebag Ammo', 400, 0, null, true),
(5, 'Sidearm Suppressor', 30, 1, null, true),
(5, 'Primary Suppressor', 45, 1, null, true),
(5, 'Special Suppressor', 60, 1, null, true),
(5, 'Medkit', 100, 2, null, true),
(5, 'Flashbang', 100, 2, null, true),
(5, 'Frag Grenade', 100, 2, null, true),
(5, 'Chicago Chopper Mag Upgrade', 500, 3, null, false),
(5, '.50 BFG Mag Upgrade', 1500, 3, null, false),
(5, 'Eliminator Mag Upgrade', 400, 3, null, false),
(5, 'Badlands Clip Upgrade', 200, 3, null, false),
(5, 'PDW Mag Upgrade', 650, 3, null, false);

-- Mechanics
insert into mechanic (camp, upgrade, price, trust, description) values
-- Copeland's Camp
(1, 'Engine I', 1200, 1, 'Engine upgrade increases the bike''s maximum speed.'),
(1, 'Exhaust I', 600, 1, 'Reduces bike noise—helps you avoid enemies while traveling.'),
(1, 'Saddlebags I', 800, 2, 'Lets you carry extra ammo and refill without looting or returning to camp.'),
(1, 'Gas Tank I', 500, 1, 'Increases fuel capacity—ride longer without refueling (does not reduce fuel consumption).'),
(1, 'Gas Tank II', 800, 2, 'Same as above.'),
(1, 'Frame I', 450, 1, 'Increases bike durability — you''ll need fewer repairs.'),
(1, 'Alt Frame I', 450, 3, 'Cosmetic only—same stats as Frame I.'),
(1, 'Nitrous I', 900, 2, 'Enables nitrous boost—useful for jumps and bike chases.'),
(1, 'Tyre I', 840, 1, 'Better tires improve traction.'),
(1, 'Alt Tyre I', 840, 2, 'Cosmetic only—same traction as Tyre I.'),
(1, 'Headlight I', 100, 1, 'Cosmetic only—same light as default.'),
(1, 'Headlight II', 120, 2, 'Cosmetic only—same light as default.'),
(1, 'Wheel I', 250, 2, 'Cosmetic only.'),
(1, 'Wheel II', 300, 2, 'Slight durability increase.'),
(1, 'Exhaust Tip I', 120, 1, 'Cosmetic only—no noise change.'),
(1, 'Exhaust Tip II', 140, 1, 'Cosmetic only—no noise change.'),
(1, 'Fender I', 100, 2, 'Slightly increases durability.'),
(1, 'Shroud I', 100, 2, 'Slightly increases durability.'),
-- Iron Mike's Camp
(3, 'Engine II', 2000, 1, 'Another engine upgrade that improves bike performance.'),
(3, 'Exhaust II', 1000, 1, 'Makes your bike quieter, making you harder to detect.'),
(3, 'Saddlebags II', 1600, 2, 'Bigger saddlebags let you refill ammo more than once.'),
(3, 'Saddlebags III', 2400, 3, 'Same as above.'),
(3, 'Gas Tank III', 1200, 2, 'Increases fuel capacity.'),
(3, 'Frame II', 1800, 2, 'Increases bike durability.'),
(3, 'Alt Frame II', 1800, 3, 'Cosmetic only. Same stats as Frame II.'),
(3, 'Suspension I', 1300, 2, 'Increases resistance to damage from high jumps.'),
(3, 'Nitrous II', 1500, 2, 'Longer nitrous boost duration.'),
(3, 'Tyre II', 1400, 2, 'Better traction.'),
(3, 'Alt Tyre II', 1800, 2, 'Cosmetic only. Same traction as Tyre II.'),
(3, 'Fork I', 800, 2, 'Increases resistance to damage from landings.'),
(3, 'Headlight III', 140, 2, 'Cosmetic only. Same light as default.'),
(3, 'Wheel III', 350, 2, 'Slight durability increase.'),
(3, 'Exhaust Tip III', 180, 2, 'Cosmetic only. No noise reduction.'),
(3, 'Exhaust Tip IV', 180, 2, 'Cosmetic only. No noise reduction.'),
(3, 'Handlebar I', 250, 2, 'Cosmetic only.'),
(3, 'Brake I', 150, 2, 'Cosmetic only.'),
(3, 'Fender II', 120, 2, 'Slightly increases durability.'),
-- Diamond Lake
(4, 'Engine III', 3600, 2, 'The best engine upgrade. You can travel at the maximum speed.'),
(4, 'Saddlebags IV', 3600, 3, 'Thanks to these saddlebags, you are able to carry the maximum amount of ammo. Buy them before you decide to eliminate the hordes roaming the map.'),
(4, 'Gas Tank IV', 2200, 0, 'Wait until you unlock Gast Tank V.'),
(4, 'Gas Tank V', 3600, 2, 'This gas tank has the best capacity. You will be able to drive for a long period of time without refueling. However, you should still look for gas stations and gas tanks - refueling at a camp can cost you a lot.'),
(4, 'Frame III', 3240, 0, 'Your bike is even more durable.'),
(4, 'Alt Frame III', 3240, 3, 'This frame differs only in the appearance. Has the same stats as the one described above.'),
(4, 'Suspension II', 2340, 0, 'Your bike is even more durable when you are landing on the ground.'),
(4, 'Nitrous III', 2700, 3, 'The best nitrous boost in the game. You need it to unlock Burnout Apocalypse trophy. You can also use it to travel faster.'),
(4, 'Tyre III', 2520, 0, 'Improves traction significantly.'),
(4, 'Radiator', 250, 0, 'Radiator makes your bike more durable. This upgrade is very cheap so buy it immediately.'),
(4, 'Headlight IV', 160, 0, 'This upgrade is purely cosmetic. The new headlight casts the same light as the default one.'),
(4, 'Wheel IV', 400, 2, 'Slightly increases the durability.'),
(4, 'Exhaust Tip V', 200, 0, 'This upgrade is purely cosmetic. Doesn''t affect the noise generated by the bike.'),
(4, 'Brake II', 200, 0, 'This upgrade is purely cosmetic.'),
(4, 'Fender III', 140, 0, 'Slightly increases the durability.'),
(4, 'Fender IV', 160, 2, 'Slightly increases the durability.'),
(4, 'Shroud II', 150, 2, 'Slightly increases the durability.');

-- Collectibles
insert into collectible(region, collectible_name, description) values
(1, 'Old Pioneer Cemetery Brochure', 'At Old Pioneer Cemetery, on a stone wall, just behind the opened cemetery gate.'),
(2, 'Hungry Jim''s Menu', 'In the town of Marion Forks, on a table in the diner.'),
(2, 'Marion Forks Bumper Stickers', 'In the town of Marion Forks, in the business west of the church, in an office, on a desk.'),
(2, 'Marion Forks Postcards', 'In the town of Marion Forks, in the business west of the church, in the reception area, on a small table.'),
(2, 'The Benefits of Bear Creek Hot Springs', 'At Bear Creek Hot Springs Ambush Camp, in the main building, on the counter next to the cash register.'),
(2, 'Salome Hot Springs Guestbook', 'In the lodge northwest of Hot Springs Camp, in a small office behind the reception counter, on a desk.'),
(2, 'Bears? Where?! Black Bear Awareness Poster', 'A poster on the exterior of a public restroom.'),
(2, 'Belknap Fire Season Warning Sign', 'A sign next to the road in the hills west of Marion Forks.'),
(2, 'Seeking Gorgeous Man', 'On the counter in the small office attached to the garage at Crazy Willie''s.'),
(2, 'Frontier Motel Brochures', 'On a small table between two chairs.'),
(3, 'Sherman''s Camp Brochure', 'Unlocked during the mission Sherman''s Camp Is Crawling.'),
(3, 'Meet the Campfire Cadets', 'At Camp Pioneer, on the first floor of the main building, on a picnic table.'),
(3, 'Sherman''s Camp Farmer''s Market Poster', 'At River Flow Farms, a poster of a rooster pinned to a cork board.'),
(3, 'Rogue Camp Whiskey Menu', 'Inside the Bucking Elk Lounge, on a booth table.'),
(5, 'Preserving the Beauty of Crater Lake Poster', 'Inside the Crater Lake Visitor Center, on the counter by cash registers.'),
(5, 'Crater Lake Postcards', 'Inside the Crater Lake Visitor Center, on a dining table in the restaurant.'),
(5, 'Fishing at Diamond Lake Village', 'At Diamond Lake Camp, nailed to a booth at the pier.'),
(6, 'Chemult Suds-Fest', 'In the town of Chemult, inside the Big Mountain Travel Center, pinned to a cork board on the wall.'),
(6, 'Balloons Over Chemult', 'In the town of Chemult, inside a smalll building, pinned to a cork board on the wall.'),
(6, 'Take Out & Tunes', 'In the town of Chemult, inside Timber Auto Parts, pinned to a cork board on the wall in the corner of the room.'),
(6, 'Pet Parade', 'In the town of Chemult, inside Chemult Country Ranch and Feed, pinned to a cork board on the wall.'),
(6, 'Chemult Community College Green Week Poster', 'At the college, a poster on the wall, just inside a glass double door.'),
(6, 'Chemult Ski Resort Brochure', 'Inside the ski resort, on the counter by the cash registers.'),
(6, 'Klamath Marsh Wetlands Preservation Flyer', 'A poster on an outdoor notice board, near a picnic table.'),
(4, 'Iron Butte Ranch Masters Tournament', 'Inside the gas station, on the counter by the cash register.'),
(3, 'Adam Finch Stout Label', 'Poster on the wall near a pinball machine.'),
(4, 'Snowbrush Ranch Alpaca Farm', 'Inside the farm house, on a table in the corner.'),
(4, 'Classified Virus Research', 'At Cloverdale Research Facility, on the second floor, on a desk in the back corner of the office. Accessible during or after the mission Expect the Worst.');

-- Rewards
-- id's -> ommit last: 2 digits of xp, 1 digit of trust, 1 digit of credits
insert into reward(id_reward, xp, trust, credits) values
('2016055' ,2000, 1600, 550),
('20155120', 2000, 1550, 1200),
('3060190', 3000, 600, 1900),
('40110350', 4000, 1100, 3500),
('40165170', 4000, 1650, 1700),
('25140170', 2500, 1400, 1700),
('2055265', 2000, 550, 2650),
('1575120', 1500, 750, 1200),
('158055', 1500, 800, 550),
('203525', 2000, 350, 250),
('2035190', 2000, 350, 1900),
('4010010', 4000, 1000, 100),
('307510', 3000, 750, 100),
('20nn', 2000, null, null),
('3020055', 3000, 2000, 550),
('30nn', 3000, null, null),
('401000300', 4000, 10000, 3000),
('30155120', 3000, 1550, 1200),
('3016055', 3000, 1600, 550),
('307525', 3000, 750, 250),
('407525', 4000, 750, 250),
('306010', 3000, 600, 100),
('205025', 2000, 500, 250),
('40230180', 4000, 2300, 1800),
('4010025', 4000, 1000, 250),
('50395105', 5000, 3950, 1050),
('6017525', 6000, 1750, 250);

-- Hordes
insert into horde(region, reward, camp, horde_name, size) values
-- Cascade Region
(1, '2016055', 1, 'Horse Lake Horde', 25),
(1, '2016055', 1, 'O''Leary Mountain Horde', 25),
(1, '2016055', 1, 'Little Bear Lake Horde', 30),
(1, '2016055', 1, 'Cascade Highway Horde', 50),
(1, '2016055', 1, 'Death Train Horde', 50),
(1, '2016055', 1, 'Proxy Falls Horde', 50),
(1, '2016055', 1, 'White King Mine Horde', 50),
(1, '2016055', 1, 'Grotto Caves Horde', 75),
-- Belknap Region
(2, '20155120', 2, 'Bear Creek Hot Springs Horde', 50),
(2, '20155120', 2, 'Belknap Crater Horde', 50),
(2, '20155120', 2, 'Lava Arch Horde', 50),
(2, '20155120', 2, 'Marion Forks Horde', 50),
(2, '20155120', 2, 'Shadow Lake Horde', 50),
(2, '20155120', 2, 'Twin Craters Horde', 50),
(2, '20155120', 2, 'Patjens Lakes Horde', 100),
-- Lost Lake Region
(3, '3060190', 3, 'Berley Lake Horde', 75),
(3, '3060190', 3, 'River Flow Farms Horde', 75),
(3, '3060190', 3, 'Sherman''s Camp Horde', 75),
(3, '3060190', 3, 'Wapinitia Road Horde', 75),
(3, '3060190', 3, 'Westfir Horde', 75),
(3, '3060190', 3, 'Metolius Lava Cave Horde', 150),
-- Crater Lake Region
(5, '40110350', 5, 'McLeod Ridge Horde', 150),
(5, '40110350', 5, 'Rimview Ranch Horde', 150),
(5, '40110350', 5, 'Mt. Bailey Horde', 275),
-- Highway 97 Region
(6, '40165170', 4, 'Beasley Lake Horde', 125),
(6, '40165170', 4, 'Cascade Lake Rail Line Horde', 125),
(6, '40165170', 4, 'Chemult Community College Horde', 125),
(6, '40165170', 4, 'Chemult Station Horde', 125),
(6, '40165170', 4, 'Friendship Ridge Horde', 125),
(6, '40165170', 4, 'Groose Gardens Horde', 125),
(6, '40165170', 4, 'Juniper Ridge Horde', 125),
(6, '40165170', 4, 'Mt. Scott Ski Resort Horde', 125),
(6, '40165170', 4, 'Rum Rye Horde', 125),
(6, '40165170', 4, 'Sagebrush Point Horde', 125),
(6, '40165170', 4, 'Solomon Hill Horde', 125),
(6, '40165170', 4, 'Beaver Marsh Rest Stop Horde', 130),
(6, '40165170', 4, 'Lober Draw Ridge Horde', 300);

-- infestations
insert into infestation (region, reward, camp, infestation_name, nr_nests) values
(5, '25140170', 5, 'South Oregon Crier Infestation', 42),
(5, '2055265', 5, 'Rimview Ranch Infestation', 3),
(6, '25140170', 4, 'Chemult College Infestation', 6),
(6, '25140170', 4, 'Cascade Lakes Rail Line Infestation', 5),
(5, '2055265', 5, 'Tumblebug River Infestation', 3),
(2, '1575120', 2, 'Patjens Lakes Infestation', 3),
(2, '1575120', 2, 'Marion Forks Infestation', 5),
(2, '1575120', 2, 'Crazy Willie''s Infestation', 4),
(1, '158055', 1, 'Pioneer Cemetery Infestation', 3),
(3, '203525', 3, 'Sherman''s Camp Infestation', 3),
(3, '2035190', 3, 'Rogue Camp Infestation', 6),
(3, '2035190', 3, 'Berley Lake Infestation', 4);

-- missions
insert into mission (id_mission, region, reward, camp, mission_name, main, start_time, description) values
(1, 1, null, null, 'He Can''t Be Far', true, '10:00am', 'Chase a bounty, Leon, through the Cascade Wilderness.'),
(2, 1, null, null, 'We''ll Make It Quick', true, '10:00am', 'Track Leon past the Buck Meadow Bridge.'),
(3, 1, null, null, 'I Say We Head North', true, '12:30am', 'Ride behind Boozer on the Old Belknap Road.'),
(4, 1, null, null, 'Bad Way To Go Out', true, '1:00pm', 'Walk point through the infested Belknap Tunnel.'),
(5, 2, null, null, 'You Got A Death Wish', true, '2:00pm', 'Search for a fuel pump at the Crazy Willie''s truck stop.'),
(6, 1, '4010010', 1, 'Drifters On The Mountain', true, '4:20pm', 'Head out on foot to retrieve your bike.'),
(7, 1, '307510', 1, 'Bugged The Hell Out', true, null, 'Search the NERO MMU for sterile bandages for Boozer.'),
(8, 1, '158055', 1, 'No Starving Patriots', true, null, 'Clear the Marauder ambush camp.'),
(9, 1, '20nn', null, 'Sounded Like Engines', true, null, 'Climb the Radio Tower and Take A Look at O''Leary Mountain.'),
(10, 1, '3020055', 1, 'Smoke On The Mountain', true, null, 'Take on a Marauder camp.'),
(11, 1, '20nn', null, 'She Rode With Us', false, null, 'Burn Alvarez''s corpse.'),
(12, 1, null, null, 'Out Of Nowhere', true, '4:00am', 'Search the Pioneer Cemetery for Leon''s drug stash.'),
(13, 1, '30nn', null, 'They''re Not Sleeping', true, '4:00am', 'Infiltrate a NERO Landing Zone to find out what they''re up to.'),
(14, 2, '401000300', 2, 'Price On Your Head', true, '2:00pm', 'Meet with Tucker and Alkai at the Hot Springs Encampment.'),
(15, 2, '30155120', 2, 'Nice And Bloody', false, null, 'Ride out on a bounty job for Tucker.'),
(16, 1, '3016055', 1, 'Drugged Outta His Mind', false, null, 'Ride out on a job for Copeland.'),
(17, 1, '3016055', 1, 'Clear Out Those Nests', true, null, 'Clear the Logging Camp Infestation Zone.'),
(18, 2, '307525', 2, 'What Did You Do?', true, null, 'Clear the abandoned NERO refugee camp.'),
(19, 2, null, null, 'Searching For Something', true, null, 'Chase down a NERO black chopper.'),
(20, 2, null, null, 'It''s Not Safe Here', true, '2:00pm', 'Search Marion Forks for a survivor who''s been spotted.'),
(21, 2, '407525', 2, 'Lots Of Sick People', true, null, 'Get Lisa to the Hot Springs Encampment nearby.'),
(22, 2, '30155120', 2, 'Everyone Has To Work', false, null, 'Ride out on a hostage rescue job for Tucker.'),
(23, 2, '20nn', null, 'It Was On Me', false, null, 'Ride up to the overrun NERO refugee camp to visit Sarah''s memorial stone.'),
(24, 1, '306010', 1, 'It''s A Rifle, Not A Gun', true, '3:00pm', 'Learn to track deer from Copeland.'),
(25, 1, '20nn', null, 'We''re Getting Low On Meat', true, null, 'Find meat for Boozer.'),
(26, 1, '30nn', null, 'Making Contact', true, '4:24pm', 'Track down the NERO agent O''Brian.'),
(27, 2, '205025', 2, 'They Won''t Let Me Leave', true, null, 'Check on Lisa.'),
(28, 2, '40230180', 2, 'The Rest Of Our Drugs', false, null, 'Ride out on a job for Tucker.'),
(29, 2, '205025', 2, 'I Brought You Something', true, null, 'Find a thunderegg for Lisa.'),
(30, 1, '20nn', null, 'I''ve Pulled Weeds Before', true, null, 'FLASHBACK: Learn from Sarah how to gather Lavender.'),
(31, 1, '30nn', null, 'Give Me A Couple Days', true, null, 'Search for Lavender.'),
(32, 2, '4010025', 2, 'What Have They Done', true, '4:00pm', 'Rescue Lisa from the Rippers.'),
(33, 1, '3016055', 1, 'Hear About A Ripper Camp?', false, null, 'Clear a Ripper camp for Copeland.'),
(34, 1, '50395105', 1, 'He Never Came Back', false, null, 'Ride out on a hostage rescue job for Copeland.'),
(35, 2, '20nn', null, 'I Should Have Left Her', false, null, 'Come back to visit Sarah''s memorial stone.'),
(36, 1, null, null, 'No One Saw It Coming', true, '4:00am', 'The world comes for you.'),
(37, 3, null, null, 'Not Gonna Kill Anyone', true, '6:00am', 'Sneak into the Lost Lake Encampment to find antibiotics.'),
(38, 3, null, null, 'No Place Else To Go', true, '6:00am', 'Take Boozer to the Lost Lake Encampment Infirmary.'),
(39, 3, '6017525', 3, 'We''ve All Done Things', true, '8:00am', 'Talk to Iron Mike about earning help for Boozer.'),
(40, 2, '20nn', null, 'What''s A Nice Gril', false, null, 'Reminisce about initial meeting with Sarah');

-- stopped on 34 'He Never Came Back' -> 'Hard To Miss' Copeland's bounty job
-- stopped on 39 'We''ve All Done Things' -> [Many] 'Sherman''s Camp is Crawling', 'I Need Your Help', 'A Score To Settle'
-- (??, ?, null, null, 'A Score To Settle', null, 'Clear a Ripper camp for Tucker.'), -- order (22,??),(39,??)

-- missions order
insert into mission_order (previous_mission, next_mission) values
(1,2),(2,3),(3,4),(4,5),(5,6),(6,7),(6,8),(7,10),(8,9),(9,10),(10,11),(10,12),(12,13),(13,14),(14,15),(10,16),(16,20),(10,17),(17,20),(14,18),(18,19),(19,40),(40,20),(20,21),(15,22),(21,22),(21,23),(21,24),(24,25),(21,26),(25,27),(26,27),(27,28),(28,29),(29,30),(30,31),(31,32),(29,33),(32,34),(33,34),(32,35),(32,36),(36,37),(37,38),(38,39);
