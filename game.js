const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#1d1d1d',
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let regions = [];
let selectedRegion = null;
let data;
let minLongitude, maxLongitude, minLatitude, maxLatitude;

function preload() {
    this.load.json('regions', 'regions.geojson');
}

function create() {
    data = this.cache.json.get('regions');

    calculateBounds();
    drawRegions.call(this);

    // ✅ Create resize function properly!
    this.resizeGame = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // ✅ Update game size
        game.config.width = width;
        game.config.height = height;

        this.scale.resize(width, height);
        this.cameras.main.setSize(width, height);

        // ✅ Re-draw the regions on resize!
        drawRegions.call(this);

        console.log('resize!');
    };

    window.addEventListener('resize', this.resizeGame.bind(this));

    // Ensure input system is enabled
    this.input.enabled = true;
}

function calculateBounds() {
    minLongitude = Infinity;
    maxLongitude = -Infinity;
    minLatitude = Infinity;
    maxLatitude = -Infinity;

    data.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates[0];
        coordinates.forEach(coord => {
            const lon = coord[0];
            const lat = coord[1];
            minLongitude = Math.min(minLongitude, lon);
            maxLongitude = Math.max(maxLongitude, lon);
            minLatitude = Math.min(minLatitude, lat);
            maxLatitude = Math.max(maxLatitude, lat);
        });
    });
}

function drawRegions() {
    // ✅ Clear existing regions before redrawing
    regions.forEach(region => {
        region.destroy();
    });
    regions = [];

    // ✅ Use actual scale values from the display size
    const scaleX = this.scale.width / (maxLongitude - minLongitude);
    const scaleY = this.scale.height / (maxLatitude - minLatitude);

    data.features.forEach((feature, index) => {
        const { coordinates } = feature.geometry;
        const { name, attack, defense, color } = feature.properties;

        const points = coordinates[0].map(coord => {
            const x = (coord[0] - minLongitude) * scaleX;
            const y = (maxLatitude - coord[1]) * scaleY;
            return [x, y];
        });

        const region = this.add.polygon(0, 0, points.flat(), Phaser.Display.Color.HexStringToColor(color).color)
            .setOrigin(0)
            .setInteractive();

        region.name = name;
        region.attack = attack;
        region.defense = defense;
        region.index = index;

        // Add pointerdown event listener to the region
        region.on('pointerdown', () => {
            console.log(`Region clicked: ${region.name}`);  // Debug log to confirm the event is firing

            if (!selectedRegion) {
                selectedRegion = region;
                console.log(`Selected ${region.name}`);
            } else if (selectedRegion !== region) {
                attackRegion(selectedRegion, region);
                selectedRegion = null;
            }
        });

        // Add pointerover event for debugging
        region.on('pointerover', () => {
            console.log(`Pointer is over ${region.name}`);  // Confirm that pointerover is being detected
        });

        // ✅ Compute center AFTER scaling
        const centerX = Phaser.Math.Average(points.flat().filter((_, i) => i % 2 === 0));
        const centerY = Phaser.Math.Average(points.flat().filter((_, i) => i % 2 !== 0));

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

        region.updateStats = () => {
            regionText.setText(`${region.name}`);
            defenseText.setText(`Def: ${region.defense}`);
            attackText.setText(`Atk: ${region.attack}`);
        };

        regions.push(region);
    });
}

function attackRegion(attacker, defender) {
    console.log(`${attacker.name} attacked ${defender.name}`);

    if (attacker.attack > defender.defense) {
        console.log(`${attacker.name} conquered ${defender.name}`);
        defender.defense = 0;
        defender.color = attacker.color;
    } else if (attacker.attack === defender.defense) {
        console.log(`${defender.name} successfully defended ${attacker.name}'s attack, but is now vulnerable`);
        defender.defense = 0;
    } else {
        console.log(`${attacker.name} failed to conquer ${defender.name}`);
        attacker.attack = 0;
    }

    attacker.updateStats();
    defender.updateStats();
}

function update() {}
