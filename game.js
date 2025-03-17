const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#1d1d1d',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let regions = [];
let selectedRegion = null;

function preload() {
    // Load the GeoJSON file
    this.load.json('regions', 'regions.geojson');
}

function create() {
    console.log('Game loaded!');

    const data = this.cache.json.get('regions');
    console.log(data); // ✅ Debug: make sure GeoJSON is loading

    // 1. Calculate the min/max latitudes and longitudes from the GeoJSON data
    let minLongitude = Infinity, maxLongitude = -Infinity, minLatitude = Infinity, maxLatitude = -Infinity;
    data.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates[0]; // Get coordinates of the region
        coordinates.forEach(coord => {
            const lon = coord[0];
            const lat = coord[1];
            minLongitude = Math.min(minLongitude, lon);
            maxLongitude = Math.max(maxLongitude, lon);
            minLatitude = Math.min(minLatitude, lat);
            maxLatitude = Math.max(maxLatitude, lat);
        });
    });

    // 2. Calculate the scaling factors based on the window size
    const scaleX = game.config.width / (maxLongitude - minLongitude);
    const scaleY = game.config.height / (maxLatitude - minLatitude);

    // 3. Loop through each region and create it
    data.features.forEach((feature, index) => {
        const { coordinates } = feature.geometry;
        const { name, attack, defense, color } = feature.properties;

        // Convert coordinates from [lon, lat] to screen coordinates
        const points = coordinates[0].map(coord => {
            const lon = coord[0];
            const lat = coord[1];

            // Scale the longitude and latitude to screen space
            const x = (lon - minLongitude) * scaleX;
            
            // Invert the latitude for proper vertical scaling
            const y = (maxLatitude - lat) * scaleY;

            return [x, y];
        });

        // Create the polygon for the region
        const region = this.add.polygon(0, 0, points.flat(), Phaser.Display.Color.HexStringToColor(color).color)
            .setOrigin(0)
            .setInteractive();

        region.name = name;
        region.attack = attack;
        region.defense = defense;
        region.index = index;

        region.on('pointerdown', () => {
            if (!selectedRegion) {
                // Select the region as the attacker
                selectedRegion = region;
                console.log(`Selected ${region.name}`);
            } else if (selectedRegion !== region) {
                // Perform the attack between selectedRegion (attacker) and the clicked region (defender)
                attackRegion(selectedRegion, region);
                selectedRegion = null; // Reset the selected region after attack
            }
        });        

        // Compute the center for the region text
        const centerX = Phaser.Math.Average(points.flat().filter((_, i) => i % 2 === 0));
        const centerY = Phaser.Math.Average(points.flat().filter((_, i) => i % 2 !== 0));

        // Add the text
        const regionText = this.add.text(centerX, centerY, `${region.name}`, {
            fontSize: '20px',
            color: '#000'
        }).setOrigin(0.5);

        const defenseText = this.add.text(centerX, centerY + 30, `Def: ${region.defense}`, {
            fontSize: '20px',
            color: '#000'
        }).setOrigin(0.5);

        const attackText = this.add.text(centerX, centerY + 60, `Atk: ${region.attack}`, {
            fontSize: '20px',
            color: '#000'
        }).setOrigin(0.5);

        // Update the region stats when they change
        region.updateStats = () => {
            regionText.setText(`${region.label}`);
            defenseText.setText(`Def: ${region.defense}`);
            attackText.setText(`Atk: ${region.attack}`);
        };

        regions.push(region);
    });

    // Handle window resize
    this.cameras.main.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', () => resizeGame(this));
}

function attackRegion(attacker, defender) {
    console.log(`${attacker.name} attacks ${defender.name}`);

    if (attacker.attack > defender.defense) {
        console.log(`${attacker.name} conquers ${defender.name}`);
        defender.defense = 0;
        defender.color = attacker.color
    } else if (attacker.attack === defender.defense) {
        console.log(`${defender.name} successfully defended ${attacker.name}'s attack, but is now vulnerable`);
        defender.defense = 0;
    } else {
        console.log(`${attacker.name} fails to conquer ${defender.name}`);
        attacker.attack = 0;
    }

    // Update the stats of both regions
    attacker.updateStats();
    defender.updateStats();
}

function resizeGame(scene) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene.scale.resize(width, height);
    scene.cameras.main.setSize(width, height);
}

function update() { }
