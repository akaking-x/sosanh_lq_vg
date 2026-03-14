import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import SearchBar from '../components/common/SearchBar'
import { skillApi } from '../services/api'

const SummonerSkillPage = () => {
  const [skills, setSkills] = useState({ vg: [], lq: [] })
  const [filteredSkills, setFilteredSkills] = useState({ vg: [], lq: [] })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const response = await skillApi.getAll()
      const skillsList = response.data

      const vgSkills = skillsList.filter((s) => s.game === 'vg')
      const lqSkills = skillsList.filter((s) => s.game === 'lq')

      setSkills({ vg: vgSkills, lq: lqSkills })
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      setSkills({ vg: [], lq: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const filterSkills = (skillsList) =>
        skillsList.filter((skill) => {
          const nameMatch = skill.name.toLowerCase().includes(query)
          const descMatch = skill.description?.toLowerCase().includes(query)
          return nameMatch || descMatch
        })

      setFilteredSkills({
        vg: filterSkills(skills.vg),
        lq: filterSkills(skills.lq),
      })
    } else {
      setFilteredSkills(skills)
    }
  }, [skills, searchQuery])

  const SkillItem = ({ skill }) => (
    <div className="card">
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {skill.icon ? (
            <img
              src={skill.icon}
              alt={skill.name}
              className="w-16 h-16 rounded-lg object-cover border border-game-accent border-opacity-30"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-game-darker border border-game-accent border-opacity-30 flex items-center justify-center text-game-text-secondary">
              ?
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-game-gold mb-2">{skill.name}</h3>
          {skill.description && (
            <p className="text-sm text-game-text-secondary mb-2">{skill.description}</p>
          )}
          {skill.cooldown && (
            <p className="text-xs text-game-accent">
              <span className="text-game-text-secondary">Thời gian chờ:</span> {skill.cooldown}s
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="min-h-screen bg-game-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="section-title">Phép bổ trợ Summoner</h1>
            <p className="text-game-text-secondary max-w-2xl">
              So sánh các phép bổ trợ summon giữa Vương Giả Vinh Diệu và Liên Quân Mobile
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <SearchBar
              placeholder="Tìm kiếm phép bổ trợ..."
              onSearch={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-game-text-secondary">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* VG Skills */}
              <div>
                <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
                  <span>🎯</span> Vương Giả Vinh Diệu
                </h2>
                {filteredSkills.vg.length === 0 ? (
                  <div className="text-center py-8 text-game-text-secondary">
                    Không tìm thấy phép bổ trợ nào
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSkills.vg.map((skill) => (
                      <SkillItem key={skill._id || skill.id} skill={skill} />
                    ))}
                  </div>
                )}
              </div>

              {/* LQ Skills */}
              <div>
                <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                  <span>🎮</span> Liên Quân Mobile
                </h2>
                {filteredSkills.lq.length === 0 ? (
                  <div className="text-center py-8 text-game-text-secondary">
                    Không tìm thấy phép bổ trợ nào
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSkills.lq.map((skill) => (
                      <SkillItem key={skill._id || skill.id} skill={skill} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default SummonerSkillPage
