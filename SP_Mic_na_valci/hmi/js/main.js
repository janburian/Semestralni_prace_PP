REX.HMI.init = function () {
    // Zde se doplní registrace čtení hodnot s targetu
    REX.HMI.addItems([
        {alias:"Fi1", cstring:"mic.TRND:u1"}
    ]);

    let fi1Input = document.getElementById('Fi1');
    REX.HMI.get('Fi1').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        fi1Input.value = value;
    });
};