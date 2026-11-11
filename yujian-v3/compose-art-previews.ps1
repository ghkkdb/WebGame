# 将浏览器保存的十二张定格实机图拼为两张对照图，保留招式名称与场景参照。
$artGroups = @(
    @{Target='通用武学_六式对照.jpg'; Names=@('引雷诀','流火诀','寒潭劲','飞叶术','回风掌','落英阵')},
    @{Target='融合绝学_六式对照.jpg'; Names=@('九霄雷剑','霜河剑域','千叶无踪','焚心断脉','百草焚香','雪魄灵蝶')}
)
foreach ($artGroup in $artGroups) {
    $artArguments = @('-hide_banner','-loglevel','error')
    foreach ($artName in $artGroup.Names) {
        $artArguments += @('-i',(Join-Path $PSScriptRoot ('武学特效预览\'+$artName+'.jpg')))
    }
    $artCrops = for ($artIndex=0; $artIndex -lt 6; $artIndex++) { '['+$artIndex+':v]crop=640:440:320:120[c'+$artIndex+']' }
    $artFilter = ($artCrops -join ';')+';[c0][c1][c2][c3][c4][c5]xstack=inputs=6:layout=0_0|640_0|1280_0|0_440|640_440|1280_440[out]'
    $artArguments += @('-filter_complex',$artFilter,'-map','[out]','-frames:v','1','-q:v','2','-y',(Join-Path $PSScriptRoot $artGroup.Target))
    & ffmpeg @artArguments
    if ($LASTEXITCODE -ne 0) { throw ('对照图生成失败：'+$artGroup.Target) }
    Write-Output ('已生成 '+$artGroup.Target)
}
