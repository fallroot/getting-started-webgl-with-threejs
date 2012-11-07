(function(window) {
    // generate random integer with range options.
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // shuffle array elements at random.
    function shuffle(array) {
        array.sort(function() {
            return 0.5 - Math.random();
        });

        return array;
    };

    // pad number with zero.
    function pad(number, length) {
       var helper = '0000000000' + number;
       return helper.slice(helper.length - (length || 2));
    }

    var renderer,
        scene,
        camera,
        light,

        actions,
        cubeSize,
        cubeSpace,
        cubesPerDigit,
        waitingTime,

        allActions   = ['add', 'subtract', 'swap'],
        windowWidth  = window.innerWidth,
        windowHeight = window.innerHeight,
        numbers      = [],
        cubes        = [],
        allCubes     = [],

        currentStep,
        stepFinished = false,
        frameCount   = 50,
        frameIndex   = 0,
        lotteries    = [];

    // initialize with various options.
    function init(options) {
        initOptions(options);

        // setup for three.js
        initRenderer();
        initScene();
        initCamera();
        initLight();

        // generate number cubes.
        initCubes();

        // start animation.
        animate();
    }

    // generate random lottery numbers.
    function seedNumber(digit) {
        for (var i = 1, length = 10 * digit; i < length; ++i) {
            numbers.push(pad(i, digit));
        }
    }

    // validate options and set default options if not given.
    function initOptions(options) {
        if (options.numbers) {
            numbers = options.numbers;
        } else if (options.digit) {
            seedNumber(options.digit);
        } else {
            throw 'numbers or digit option must be initialized.';
        }

        actions = options.actions || allActions;

        if (!Array.isArray(actions)) {
            throw 'actions options must be partial array of ["add", "subtract", "swap"]';
        }

        actions.forEach(function(action) {
            if (allActions.indexOf(action) < 0) {
                throw 'actions options must be partial array of ["add", "subtract", "swap"]';
            }
        });

        cubeSize       = options.cubeSize       || 200;
        cubeSpace      = options.cubeSpace      || 100;
        cubesPerDigit = options.cubesPerDigit || 10;
        waitingTime    = options.waitingTime    || 3000;
    }

    function initRenderer() {
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(windowWidth, windowHeight);
        document.body.appendChild(renderer.domElement);
    }

    function initScene() {
        scene = new THREE.Scene();
    }

    function initCamera() {
        camera = new THREE.PerspectiveCamera(60, windowWidth / windowHeight, 1, 10000);
        camera.position.z = 1500;
        scene.add(camera);
    }

    function initLight() {
        light = new THREE.SpotLight();
        light.position.set(0, 500, 2000);
        scene.add(light);
    }

    // create cube textured with number.
    function createNumberMaterial(number) {
        var canvas  = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            halfWidth = Math.floor(cubeSize / 2);

        canvas.width  = cubeSize;
        canvas.height = cubeSize;

        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowBlur    = 2;
        context.shadowColor   = 'rgba(0, 0, 0, 0.75)';

        context.font = 'bold ' + halfWidth + 'px Kefa';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#ffffff';
        context.fillText(number, halfWidth, halfWidth);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        var material = new THREE.MeshLambertMaterial({
            map: texture
        });
        material.transparent = true;

        return material;
    }

    // initialize cubes.
    function initCubes() {
        var angle     = 360 * (Math.PI / 180),
            materials = [];

        for (var i = 0; i < 10; ++i) {
            materials.push(createNumberMaterial(i));
        }

        var cube = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);

        for (var i = 0, length = cubesPerDigit * 10; i < length; ++i) {
            var basicMaterial = new THREE.MeshLambertMaterial({
                color: 0x999999
            });

            var number = i % 10,
                object = THREE.SceneUtils.createMultiMaterialObject(cube, [materials[number], basicMaterial]);

            // assign custrom properties.
            object.number = number;

            object.position.x = Math.random() * 2000 - 1000;
            object.position.y = Math.random() * 2000 - 1000;
            object.position.z = Math.random() * 1000 - 3000;

            object.rotation.x = Math.random() * angle;
            object.rotation.y = Math.random() * angle;
            object.rotation.z = Math.random() * angle;

            if (cubes[number] === undefined) {
                cubes[number] = [];
            }

            cubes[number].push(object);
            allCubes.push(object);

            scene.add(object);
        }
    }

    function animate() {
        render();
        requestAnimationFrame(animate);
    }

    function render() {
        for (var i = 0, length = allCubes.length; i < length; ++i) {
            var object = allCubes[i];

            if (object.selected) {
                if (currentStep) {
                    if (stepFinished) {
                        if (currentStep == 'initial') {
                            object.children[1].material.color.setHex(0x02bff6);
                            object.rotation.x = 0;
                            object.rotation.z = 0;
                        }
                        object.rotation.y += .015;
                    } else {
                        var dx = object[currentStep].dx,
                            dy = object[currentStep].dy,
                            dz = object[currentStep].dz;

                        if (dx) {
                            object.position.x += dx;
                        }
                        if (dy) {
                            object.position.y += dy;
                        }
                        if (dz) {
                            object.position.z += dz;
                        }
                    }
                }
            } else {
                object.rotation.x += .03;
                object.rotation.y += .02;
            }
        }

        if (currentStep && !stepFinished) {
            if (frameIndex < frameCount - 1) {
                ++frameIndex;
            } else {
                stepFinished = true;
            }
        }

        renderer.render(scene, camera);
    }

    function reset() {
        currentStep = null;
        frameIndex = 0;
        stepFinished = false;

        for (var i = 0, length = allCubes.length; i < length; ++i) {
            var object = allCubes[i];

            if (object.selected) {
                object.children[1].material.color.setHex(0x999999);
                object.position.x = object.original.x;
                object.position.y = object.original.y;
                object.position.z = object.original.z;

                object.original = null;
                object.initial  = null;
                object.final    = null;

                object.selected = false;
            }
        }
    }

    // generate lottery numbers that is not drawn yet.
    function generateLottery() {
        var lottery,
            length = numbers.length;

        do {
            lottery = numbers[randomInt(0, length - 1)];
        } while (lotteries.indexOf(lottery) > -1);

        lotteries.push(lottery);

        return lottery;
    }

    // draw one lottery number.
    function draw() {
        var lottery      = generateLottery(),
            initialCubes = [],
            finalCubes   = [],
            action,
            functions;

        // reset first.
        reset();

        // generate final cubes.
        lottery.split('').forEach(function(number) {
            var cube = pickCube(number);
            cube.type = 'correct';
            finalCubes.push(cube);
        });

        initialCubes = finalCubes.slice();

        // console.log(lottery)

        // generate initial cubes.
        functions = {
            add: function(){
                initialCubes.splice(randomInt(2, initialCubes.length - 1), 1);
            },
            subtract: function() {
                var cube = pickCube(randomInt(0, 9));
                cube.type = 'fake';
                initialCubes.splice(randomInt(2, initialCubes.length - 1), 0, cube);
            },
            swap: function(){
                shuffle(initialCubes);
            }
        };

        action = actions[randomInt(0, actions.length - 1)];
        functions[action]();

        // console.log(action);

        calcInitialPosition(initialCubes);
        calcFinalPosition(finalCubes);

        currentStep = 'initial';

        setTimeout(function() {
            currentStep  = 'final';
            frameIndex   = 0;
            stepFinished = false;
        }, waitingTime);
    }

    // calcurate position to place cubes at center of screen.
    function calcInitialPosition(cubes) {
        var length = cubes.length,
            x      = -Math.floor((cubeSize * length + (length - 1) * cubeSpace) / 2);

        cubes.forEach(function(cube, index) {
            cube.initial = {
                x: x + (cubeSize + cubeSpace) * index,
                y: 0,
                z: 100
            };

            if (cube.type == 'fake') {
                cube.final = cube.original;

                cube.final.dx = (cube.final.x - cube.initial.x) / frameCount;
                cube.final.dy = (cube.final.y - cube.initial.y) / frameCount;
                cube.final.dz = (cube.final.z - cube.initial.z) / frameCount;
            }

            cube.initial.dx = (cube.initial.x - cube.original.x) / frameCount;
            cube.initial.dy = (cube.initial.y - cube.original.y) / frameCount;
            cube.initial.dz = (cube.initial.z - cube.original.z) / frameCount;
        });
    }

    // calcurate position after an action is finished.
    function calcFinalPosition(cubes) {
        var length = numbers[0].length,
            x      = -Math.floor((cubeSize * length + (length - 1) * cubeSpace) / 2);

        cubes.forEach(function(cube, index) {
            if (!cube.initial) {
                cube.initial = cube.original;
            }

            cube.final = {
                x: x + (cubeSize + cubeSpace) * index,
                y: 0,
                z: 100
            };

            cube.final.dx = (cube.final.x - cube.initial.x) / frameCount;
            cube.final.dy = (cube.final.y - cube.initial.y) / frameCount;
            cube.final.dz = (cube.final.z - cube.initial.z) / frameCount;
        });
    }

    // choose one cube among cubes what has a particular number and is not selected.
    function pickCube(number) {
        var index,
            cube,
            current;

        do {
            index = randomInt(0, cubesPerDigit - 1);
            cube  = cubes[number][index];

            var current = cube.position;

            cube.original = {
                x: current.x,
                y: current.y,
                z: current.z
            };
        } while (cube.selected);

        cube.selected = true;

        return cube;
    }

    window.Lottery = {
        init: init,
        draw: draw
    };
}(window));